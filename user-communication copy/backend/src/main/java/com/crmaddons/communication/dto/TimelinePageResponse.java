package com.crmaddons.communication.dto;

import java.util.List;

public record TimelinePageResponse(
        List<TimelineEventResponse> items,
        PaginationInfo pagination
) {
    public record PaginationInfo(int page, int size, long total) {}
}
