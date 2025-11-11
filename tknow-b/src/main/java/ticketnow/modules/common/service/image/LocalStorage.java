package ticketnow.modules.common.service.image;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.time.LocalDate;
import java.util.UUID;

// 로컬 디스크 저장용 단순 스토리지 컴포넌트
// - 운영환경에서 S3 등으로 교체할 수 있도록 분리
// - 반환은 웹 접근 가능한 상대 URL(/uploads/...) 형태
@Component
@RequiredArgsConstructor
public class LocalStorage {

    // 업로드 루트 디렉터리 (필요 시 환경설정으로 분리 가능)
    private final String uploadRoot =
    		 System.getProperty("user.dir") + File.separator + "uploads";

    // 파일 저장 (yyyy/MM/dd 하위 디렉터리 분류)
    // @return /uploads/2025/10/18/uuid.ext 형태의 상대 URL
    public String save(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("업로드할 파일이 없습니다.");
        }

        LocalDate today = LocalDate.now();
        String subdir = today.getYear()
                + File.separator + String.format("%02d", today.getMonthValue())
                + File.separator + String.format("%02d", today.getDayOfMonth());

        File dir = new File(uploadRoot, subdir);
        if (!dir.exists() && !dir.mkdirs()) {
            throw new IOException("업로드 디렉토리 생성 실패: " + dir.getAbsolutePath());
        }

        String originalName = file.getOriginalFilename();
        String ext = "";
        if (originalName != null && originalName.lastIndexOf('.') != -1) {
            ext = originalName.substring(originalName.lastIndexOf('.'));
        }

        String savedName = UUID.randomUUID() + ext;
        File target = new File(dir, savedName);

        //  상위 디렉터리가 혹시라도 사라졌을 경우 대비
        File parentDir = target.getParentFile();
        if (!parentDir.exists()) {
            parentDir.mkdirs(); // 모든 상위폴더 포함 생성
        }

        file.transferTo(target);

        return "/" + uploadRoot + "/" + subdir.replace(File.separatorChar, '/') + "/" + savedName;
    }

    // 상대 URL을 실제 파일 경로로 변환해 삭제
    public boolean delete(String relativeUrl) {
        if (relativeUrl == null || relativeUrl.isBlank()) return false;
        String filepath = relativeUrl.replaceFirst("^/", "");
        File file = new File(filepath);
        return file.exists() && file.delete();
    }
}
