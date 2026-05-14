<?php

return [
    'base_url' => 'https://example.com',
    'db' => [
        'host' => 'localhost',
        'name' => 'u123456789_bethelmind',
        'user' => 'u123456789_admin',
        'pass' => 'CHANGE_ME',
        'charset' => 'utf8mb4',
    ],
    'ai' => [
        'provider' => 'gemini',
        'gemini_api_key' => 'CHANGE_ME',
        'gemini_model' => 'gemini-2.5-flash-lite',
    ],
    'whatsapp' => [
        'provider' => 'meta_cloud',
        'access_token' => 'CHANGE_ME',
        'phone_number_id' => 'CHANGE_ME',
        'verify_token' => 'CHANGE_ME',
        'admin_numbers' => ['+2348012345678'],
        'auto_reply_enabled' => false,
        'auto_reply_text' => 'Thanks for contacting Bethelmind. Please share your business name and what you need help with (suite: Growth/Commerce/Education/Healthcare/Real Estate/Logistics).',
    ],
    'cron' => [
        'token' => 'CHANGE_ME',
    ],
    'uploads' => [
        'dir' => __DIR__ . '/../uploads',
        'url' => '/uploads',
        'max_bytes' => 8388608,
    ],
    'security' => [
        'session_name' => 'bm_cms',
    ],
];

