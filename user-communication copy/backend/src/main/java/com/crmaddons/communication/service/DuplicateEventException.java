package com.crmaddons.communication.service;

public class DuplicateEventException extends RuntimeException {

    private final String tenantId;
    private final String source;
    private final String externalId;

    public DuplicateEventException(String tenantId, String source, String externalId) {
        super("Duplicate event: tenant=%s, source=%s, externalId=%s".formatted(tenantId, source, externalId));
        this.tenantId = tenantId;
        this.source = source;
        this.externalId = externalId;
    }

    public String getTenantId() { return tenantId; }
    public String getSource() { return source; }
    public String getExternalId() { return externalId; }
}
