package com.crmaddons.communication.dto;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public record TimelineEventResponse(
        UUID id,
        String channel,
        String direction,
        String status,
        OffsetDateTime timestamp,
        String subject,
        String summary,
        List<Map<String, String>> participants,
        String source,
        List<Map<String, String>> attachments
) {}
