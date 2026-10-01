package com.lekkrek.controller;

import com.lekkrek.entity.Plat;
import com.lekkrek.repository.PlatRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("${api.prefix.public:/api/v1/public}/menu")
@CrossOrigin(origins = "*")
public class MenuController {

    private final PlatRepository platRepository;

    public MenuController(PlatRepository platRepository) {
        this.platRepository = platRepository;
    }

    @GetMapping
    public List<Plat> searchPlats(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String resto,
            @RequestParam(required = false) Double budgetMax,
            @RequestParam(required = false) String quartier,
            @RequestParam(required = false) String moment) {
        
        keyword = (keyword != null && !keyword.isBlank()) ? keyword : null;
        resto = (resto != null && !resto.isBlank()) ? resto : null;
        quartier = (quartier != null && !quartier.isBlank()) ? quartier : null;
        moment = (moment != null && !moment.isBlank()) ? moment : null;

        return platRepository.searchPlats(keyword, resto, budgetMax, quartier, moment);
    }
}
