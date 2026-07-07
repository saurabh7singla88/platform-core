package com.crmaddons.communication.controller;

import com.crmaddons.communication.dto.EventDetailResponse;
import com.crmaddons.communication.dto.IngestEventRequest;
import com.crmaddons.communication.service.TimelineService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1")
public class IngestController {

    private final TimelineService timelineService;

    public IngestController(TimelineService timelineService) {
        this.timelineService = timelineService;
    }

    @PostMapping("/ingest/events")
    public ResponseEntity<EventDetailResponse> ingestEvent(
            @RequestHeader("X-Tenant-Id") String tenantId,
            @Valid @RequestBody IngestEventRequest request
    ) {
        EventDetailResponse response = timelineService.ingestEvent(tenantId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
