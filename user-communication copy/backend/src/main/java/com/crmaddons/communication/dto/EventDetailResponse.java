package com.crmaddons.communication.dto;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public record EventDetailResponse(
        UUID id,
        String tenantId,
        String entityType,
        String entityId,
        String channel,
        String direction,
        String status,
        OffsetDateTime timestamp,
        String subject,
        String summary,
        String source,
        String externalId,
        List<Map<String, String>> participants,
        Map<String, String> detailRef,
        List<Map<String, String>> attachments,
        Map<String, Object> metadata,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {}
