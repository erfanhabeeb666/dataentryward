package com.erfan.warddata.Services;

import com.erfan.warddata.Models.Ward;
import com.erfan.warddata.Repos.WardRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class WardService {
    private final WardRepository wardRepository;

    public WardService(WardRepository wardRepository) {
        this.wardRepository = wardRepository;
    }

    public Ward createWard(Ward ward) {
        return wardRepository.save(ward);
    }

    public Ward getWardById(Long id) {
        return wardRepository.findById(id).orElseThrow(() -> new RuntimeException("Ward not found"));
    }

    public Page<Ward> getAllWards(Pageable pageable) {
        return wardRepository.findAll(pageable);
    }

    public Ward updateWard(Long id, Ward wardDetails) {
        Ward ward = getWardById(id);
        ward.setName(wardDetails.getName());
        ward.setLocalBody(wardDetails.getLocalBody());
        ward.setTotalHouses(wardDetails.getTotalHouses());
        return wardRepository.save(ward);
    }

    public void deleteWard(Long id) {
        wardRepository.deleteById(id);
    }
}
