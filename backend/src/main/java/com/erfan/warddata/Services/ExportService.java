package com.erfan.warddata.Services;

import com.erfan.warddata.Models.FamilyMember;
import com.erfan.warddata.Models.Household;
import com.erfan.warddata.Repos.FamilyMemberRepository;
import com.erfan.warddata.Repos.HouseholdRepository;
import com.lowagie.text.Document;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.util.List;

@Service
public class ExportService {

    private final HouseholdRepository householdRepository;
    private final FamilyMemberRepository familyMemberRepository;

    public ExportService(HouseholdRepository householdRepository, FamilyMemberRepository familyMemberRepository) {
        this.householdRepository = householdRepository;
        this.familyMemberRepository = familyMemberRepository;
    }

    public byte[] exportWardDataToExcel(Long wardId) {
        List<Household> households = householdRepository.findAllByWardId(wardId);

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Ward Data");

            // Header
            Row headerRow = sheet.createRow(0);
            String[] columns = { "Household ID", "House No", "Address", "Ration Card", "Type", "Status", "Member Name",
                    "Gender", "Age", "Aadhaar" };
            for (int i = 0; i < columns.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
                CellStyle style = workbook.createCellStyle();
                Font font = (Font) workbook.createFont();
                ((org.apache.poi.ss.usermodel.Font) font).setBold(true);
                style.setFont((org.apache.poi.ss.usermodel.Font) font);
                cell.setCellStyle(style);
            }

            int rowIdx = 1;

            for (Household h : households) {
                List<FamilyMember> members = familyMemberRepository.findByHouseholdId(h.getId());

                if (members.isEmpty()) {
                    Row row = sheet.createRow(rowIdx++);
                    fillHouseholdData(row, h);
                } else {
                    for (FamilyMember m : members) {
                        Row row = sheet.createRow(rowIdx++);
                        fillHouseholdData(row, h);
                        row.createCell(6).setCellValue(m.getFullName());
                        row.createCell(7).setCellValue(m.getGender() != null ? m.getGender().name() : "");
                        row.createCell(8).setCellValue(m.getDateOfBirth() != null ? m.getDateOfBirth().toString() : "");
                        row.createCell(9).setCellValue(m.getAadhaarNumber());
                    }
                }
            }

            workbook.write(out);
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to export Excel", e);
        }
    }

    private void fillHouseholdData(Row row, Household h) {
        row.createCell(0).setCellValue(h.getId());
        row.createCell(1).setCellValue(h.getHouseNumber());
        row.createCell(2).setCellValue(h.getFullAddress());
        row.createCell(3).setCellValue(h.getRationCardNumber());
        row.createCell(4).setCellValue(h.getRationCardType() != null ? h.getRationCardType().name() : "");
        row.createCell(5).setCellValue(h.getVisitStatus() != null ? h.getVisitStatus().name() : "");
    }

    public byte[] exportWardDataToPdf(Long wardId) {
        List<Household> households = householdRepository.findAllByWardId(wardId);

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document();
            PdfWriter.getInstance(document, out);
            document.open();

            Font fontTitle = FontFactory.getFont(FontFactory.HELVETICA_BOLD);
            fontTitle.setSize(18);
            Paragraph title = new Paragraph("Ward Data Report - Ward " + wardId, fontTitle);
            title.setAlignment(Paragraph.ALIGN_CENTER);
            document.add(title);

            PdfPTable table = new PdfPTable(5); // 5 Columns
            table.setWidthPercentage(100);
            table.setSpacingBefore(15);

            addPdfHeader(table, "House No");
            addPdfHeader(table, "Ration Card");
            addPdfHeader(table, "Member Name");
            addPdfHeader(table, "Gender");
            addPdfHeader(table, "Aadhaar");

            for (Household h : households) {
                List<FamilyMember> members = familyMemberRepository.findByHouseholdId(h.getId());
                if (members.isEmpty()) {
                    table.addCell(h.getHouseNumber());
                    table.addCell(h.getRationCardNumber());
                    table.addCell("-");
                    table.addCell("-");
                    table.addCell("-");
                } else {
                    for (FamilyMember m : members) {
                        table.addCell(h.getHouseNumber());
                        table.addCell(h.getRationCardNumber());
                        table.addCell(m.getFullName());
                        table.addCell(m.getGender() != null ? m.getGender().name() : "");
                        table.addCell(m.getAadhaarNumber());
                    }
                }
            }

            document.add(table);
            document.close();

            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to export PDF", e);
        }
    }

    private void addPdfHeader(PdfPTable table, String headerTitle) {
        com.lowagie.text.pdf.PdfPCell header = new com.lowagie.text.pdf.PdfPCell();
        header.setBackgroundColor(java.awt.Color.LIGHT_GRAY);
        header.setPadding(5);
        header.setPhrase(new com.lowagie.text.Phrase(headerTitle));
        table.addCell(header);
    }
}
