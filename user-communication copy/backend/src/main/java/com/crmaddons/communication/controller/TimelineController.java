package com.crmaddons.communication.controller;

import com.crmaddons.communication.dto.EventDetailResponse;
import com.crmaddons.communication.dto.TimelinePageResponse;
import com.crmaddons.communication.service.TimelineService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
public class TimelineController {

    private final TimelineService timelineService;

    public TimelineController(TimelineService timelineService) {
        this.timelineService = timelineService;
    }

    @GetMapping("/timeline")
    public ResponseEntity<TimelinePageResponse> getTimeline(
            @RequestHeader("X-Tenant-Id") String tenantId,
            @RequestParam String entityType,
            @RequestParam String entityId,
            @RequestParam(required = false) List<String> channels,
            @RequestParam(required = false) List<String> directions,
            @RequestParam(required = false) OffsetDateTime from,
            @RequestParam(required = false) OffsetDateTime to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "25") int size
    ) {
        if (size > 100) size = 100;

        TimelinePageResponse response = timelineService.getTimeline(
                tenantId, entityType, entityId, channels, directions, from, to, page, size
        );
        return ResponseEntity.ok(response);
    }

    @GetMapping("/events/{eventId}")
    public ResponseEntity<EventDetailResponse> getEventDetail(
            @RequestHeader("X-Tenant-Id") String tenantId,
            @PathVariable UUID eventId
    ) {
        return timelineService.getEventDetail(tenantId, eventId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
