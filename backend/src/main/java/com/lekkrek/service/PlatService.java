package com.lekkrek.service;

import com.lekkrek.entity.Plat;
import com.lekkrek.dto.PlatRequestDTO;

import java.util.List;

public interface PlatService {
    List<Plat> getAllPlats();
    Plat createPlat(PlatRequestDTO request);
    Plat updatePlat(Long id, PlatRequestDTO request);
    void deletePlat(Long id);
    Plat updatePlatStatus(Long id, String status);
}
