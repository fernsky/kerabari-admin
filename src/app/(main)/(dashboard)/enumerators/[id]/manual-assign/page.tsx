"use client";
import { useParams } from "next/navigation";

import { useState } from "react";

const ManualAssignPage = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(false);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">
        Manual Assignment for Enumerator {id}
      </h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600 mb-4">
          This is the manual assignment page where you can assign tasks to the
          enumerator.
        </p>
        {/* Add your assignment form or content here */}
      </div>
    </div>
  );
};

export default ManualAssignPage;
