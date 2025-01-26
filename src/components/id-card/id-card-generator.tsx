"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { IdCardDetails } from "@/types/idCard";
import { Alert, AlertDescription } from "@/components/ui/alert";
import idCardSvg from "@/lib/assets/buddhashanti-id-card.svg";
import { PDFDocument, rgb } from "pdf-lib";
import { useState } from "react";
import React from "react";

const getBase64FromUrl = async (url: string): Promise<string> => {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

interface IdCardGeneratorProps {
  details: IdCardDetails;
  avatar?: string | null; // Add avatar prop
}

export function IdCardGenerator({ details, avatar }: IdCardGeneratorProps) {
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Validate if all required fields are present
  const isValid =
    details.nepaliName && details.nepaliAddress && details.nepaliPhone;

  const generateSvg = async () => {
    if (!isValid) return null;

    try {
      const response = await fetch(idCardSvg.src);
      if (!response.ok) throw new Error("Failed to load SVG template");

      let svgContent = await response.text();

      // Replace placeholders with actual data
      svgContent = svgContent.replace(/@नाम/g, details.nepaliName || "");
      svgContent = svgContent.replace(/@ठेगाना/g, details.nepaliAddress || "");
      svgContent = svgContent.replace(
        /@सम्पर्क नं\./g,
        details.nepaliPhone || "",
      );

      // Replace photo layer with avatar image if available
      if (avatar) {
        try {
          const base64Image = await getBase64FromUrl(avatar);
          const photoLayerRegex = /<rect[^>]*id="photo-layer"[^>]*\/>/;
          const imageElement = `<image id="photo-layer" x="114" y="179" width="135" height="155" href="${base64Image}" preserveAspectRatio="xMidYMid slice"/>`;
          svgContent = svgContent.replace(photoLayerRegex, imageElement);
        } catch (avatarErr) {
          console.error("Failed to load avatar:", avatarErr);
          // Continue without avatar if it fails to load
        }
      }

      // Create preview URL
      const svgBlob = new Blob([svgContent], { type: "image/svg+xml" });
      const url = URL.createObjectURL(svgBlob);
      setPreviewUrl(url);

      return svgContent;
    } catch (err) {
      console.error("SVG generation error:", err);
      setError("Failed to generate ID card template");
      return null;
    }
  };

  // Generate preview on mount and when details change
  React.useEffect(() => {
    generateSvg();
    return () => {
      // Cleanup preview URL when component unmounts
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [details.nepaliName, details.nepaliAddress, details.nepaliPhone, avatar]);

  const convertSvgToPng = async (svgString: string): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const svg = new Blob([svgString], { type: "image/svg+xml" });
      const url = URL.createObjectURL(svg);

      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 359; // SVG width
        canvas.height = 493; // SVG height
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          URL.revokeObjectURL(url);
          reject(new Error("Failed to get canvas context"));
          return;
        }

        ctx.drawImage(img, 0, 0);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Failed to convert canvas to blob"));
              return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
              if (reader.result instanceof ArrayBuffer) {
                resolve(reader.result);
              } else {
                reject(new Error("Failed to convert blob to array buffer"));
              }
            };
            reader.onerror = reject;
            reader.readAsArrayBuffer(blob);
            URL.revokeObjectURL(url);
          },
          "image/png",
          1.0,
        );
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Failed to load SVG"));
      };

      img.src = url;
    });
  };

  const handleDownload = async () => {
    try {
      if (!isValid) {
        setError("All fields must be filled to generate ID card");
        return;
      }

      const svg = await generateSvg();
      if (!svg) return;

      // Convert SVG to PNG
      const pngArrayBuffer = await convertSvgToPng(svg);

      // Create PDF document
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([359, 493]);

      // Embed PNG in PDF
      const pngImage = await pdfDoc.embedPng(pngArrayBuffer);

      // Draw image on page
      page.drawImage(pngImage, {
        x: 0,
        y: 0,
        width: page.getWidth(),
        height: page.getHeight(),
      });

      // Save and download PDF
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const downloadUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `id-card-${details.nepaliName}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(downloadUrl);
      setError(null);
    } catch (err) {
      console.error("PDF generation error:", err);
      setError("Failed to generate PDF. Please try again.");
    }
  };

  if (!isValid) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Please fill in all Nepali details (name, address, phone) to generate
          ID card
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">ID Card Preview</h3>
        <Button onClick={handleDownload} className="gap-2">
          <Download className="h-4 w-4" />
          Download ID Card
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="border rounded-lg p-4">
        <img
          src={previewUrl || idCardSvg.src}
          alt="ID Card Preview"
          className="w-full h-auto"
        />
      </div>
    </div>
  );
}
