package com.crmaddons.communication.repository;

import com.crmaddons.communication.entity.CommunicationEvent;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CommunicationEventRepository extends JpaRepository<CommunicationEvent, UUID> {

    @Query("""
        SELECT e FROM CommunicationEvent e
        WHERE e.tenantId = :tenantId
          AND e.entityType = :entityType
          AND e.entityId = :entityId
          AND e.deletedAt IS NULL
          AND (:channels IS NULL OR e.channel IN :channels)
          AND (:directions IS NULL OR e.direction IN :directions)
          AND (:from IS NULL OR e.eventTimestamp >= :from)
          AND (:to IS NULL OR e.eventTimestamp <= :to)
        ORDER BY e.eventTimestamp DESC
    """)
    Page<CommunicationEvent> findTimeline(
            @Param("tenantId") String tenantId,
            @Param("entityType") String entityType,
            @Param("entityId") String entityId,
            @Param("channels") List<String> channels,
            @Param("directions") List<String> directions,
            @Param("from") OffsetDateTime from,
            @Param("to") OffsetDateTime to,
            Pageable pageable
    );

    Optional<CommunicationEvent> findByIdAndTenantIdAndDeletedAtIsNull(UUID id, String tenantId);

    boolean existsByTenantIdAndSourceAndExternalId(String tenantId, String source, String externalId);
}
