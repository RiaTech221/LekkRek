package com.lekkrek.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PageContentRequestDTO {
    private String title;
    private String seoKeywords;
    private String content;
}
