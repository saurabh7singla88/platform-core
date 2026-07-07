package com.crmaddons.communication.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

public record IngestEventRequest(
        @NotBlank String entityType,
        @NotBlank String entityId,
        @NotBlank String channel,
        @NotBlank String direction,
        String status,
        @NotNull OffsetDateTime timestamp,
        String subject,
        String summary,
        @NotBlank String source,
        @NotBlank String externalId,
        List<Map<String, String>> participants,
        Map<String, String> detailRef,
        List<Map<String, String>> attachments,
        Map<String, Object> metadata
) {}
