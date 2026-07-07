package com.crmaddons.communication.service;

import com.crmaddons.communication.dto.*;
import com.crmaddons.communication.entity.CommunicationEvent;
import com.crmaddons.communication.repository.CommunicationEventRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class TimelineService {

    private final CommunicationEventRepository repository;

    public TimelineService(CommunicationEventRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public TimelinePageResponse getTimeline(
            String tenantId,
            String entityType,
            String entityId,
            List<String> channels,
            List<String> directions,
            OffsetDateTime from,
            OffsetDateTime to,
            int page,
            int size
    ) {
        Page<CommunicationEvent> result = repository.findTimeline(
                tenantId, entityType, entityId,
                channels != null && !channels.isEmpty() ? channels : null,
                directions != null && !directions.isEmpty() ? directions : null,
                from, to,
                PageRequest.of(page, size)
        );

        List<TimelineEventResponse> items = result.getContent().stream()
                .map(this::toTimelineResponse)
                .toList();

        return new TimelinePageResponse(
                items,
                new TimelinePageResponse.PaginationInfo(page, size, result.getTotalElements())
        );
    }

    @Transactional(readOnly = true)
    public Optional<EventDetailResponse> getEventDetail(String tenantId, UUID eventId) {
        return repository.findByIdAndTenantIdAndDeletedAtIsNull(eventId, tenantId)
                .map(this::toDetailResponse);
    }

    @Transactional
    public EventDetailResponse ingestEvent(String tenantId, IngestEventRequest request) {
        if (repository.existsByTenantIdAndSourceAndExternalId(tenantId, request.source(), request.externalId())) {
            throw new DuplicateEventException(tenantId, request.source(), request.externalId());
        }

        CommunicationEvent event = new CommunicationEvent();
        event.setTenantId(tenantId);
        event.setEntityType(request.entityType());
        event.setEntityId(request.entityId());
        event.setChannel(request.channel());
        event.setDirection(request.direction());
        event.setStatus(request.status() != null ? request.status() : "completed");
        event.setEventTimestamp(request.timestamp());
        event.setSubject(request.subject());
        event.setSummary(request.summary());
        event.setSource(request.source());
        event.setExternalId(request.externalId());
        event.setParticipants(request.participants() != null ? request.participants() : List.of());
        event.setDetailRef(request.detailRef());
        event.setAttachments(request.attachments() != null ? request.attachments() : List.of());
        event.setMetadata(request.metadata() != null ? request.metadata() : java.util.Map.of());

        CommunicationEvent saved = repository.save(event);
        return toDetailResponse(saved);
    }

    private TimelineEventResponse toTimelineResponse(CommunicationEvent e) {
        return new TimelineEventResponse(
                e.getId(),
                e.getChannel(),
                e.getDirection(),
                e.getStatus(),
                e.getEventTimestamp(),
                e.getSubject(),
                e.getSummary(),
                e.getParticipants(),
                e.getSource(),
                e.getAttachments()
        );
    }

    private EventDetailResponse toDetailResponse(CommunicationEvent e) {
        return new EventDetailResponse(
                e.getId(),
                e.getTenantId(),
                e.getEntityType(),
                e.getEntityId(),
                e.getChannel(),
                e.getDirection(),
                e.getStatus(),
                e.getEventTimestamp(),
                e.getSubject(),
                e.getSummary(),
                e.getSource(),
                e.getExternalId(),
                e.getParticipants(),
                e.getDetailRef(),
                e.getAttachments(),
                e.getMetadata(),
                e.getCreatedAt(),
                e.getUpdatedAt()
        );
    }
}
