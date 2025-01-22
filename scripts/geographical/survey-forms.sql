-- Building Survey
INSERT INTO
    public.acme_odk_survey_forms (
        id,
        "name",
        url,
        odk_project_id,
        odk_form_id,
        username,
        "password",
        attachment_paths,
        update_interval,
        last_fetched
    )
VALUES
    (
        'buddhashanti_building_survey',
        'Buddhashanti Building Survey',
        '"\"https://survey.digprofile.com\""',
        4,
        'Kerabari_Buildings',
        '"\"supervisor@likhupike.com\""',
        '"\"supervisor\""',
        '{"{\"path\":\"building_image\",\"type\":\"building_image\"}","{\"path\":\"monitoring_audio\",\"type\":\"audio_monitoring\"}","{\"path\":\"enumerator_selfie\",\"type\":\"building_selfie\"}"}',
        100000,
        '2025-01-21 11:35:10.984'
    );

INSERT INTO
    public.acme_odk_survey_forms (
        id,
        "name",
        url,
        odk_project_id,
        odk_form_id,
        username,
        "password",
        attachment_paths,
        update_interval,
        last_fetched
    )
VALUES
    (
        'buddhashanti_business_survey',
        'Buddhashanti Business Survey',
        '"\"https://survey.digprofile.com\""',
        4,
        'biz',
        '"\"supervisor@likhupike.com\""',
        '"\"supervisor\""',
        '{"{\"path\":\"bimg\",\"type\":\"business_image\"}","{\"path\":\"bimg_selfie\",\"type\":\"business_selfie\"}","{\"path\":\"audio_monitoring\",\"type\":\"audio_monitoring\"}"}',
        720000,
        '2025-01-22 06:27:58.231'
    );