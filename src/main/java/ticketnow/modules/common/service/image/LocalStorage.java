package ticketnow.modules.common.service.image;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

// 로컬 디스크 저장용 단순 스토리지 컴포넌트
// - 운영환경에서 S3 등으로 교체할 수 있도록 분리
// - 반환은 웹 접근 가능한 상대 URL(/uploads/...) 형태
@Component
@Slf4j
public class LocalStorage {

    // 업로드 루트 디렉터리 (필요 시 환경설정으로 분리 가능)
    private final String uploadRoot ;
    		
  
        public LocalStorage() {
        	   this.uploadRoot = "C:" + File.separator + "tkupload";
        	   log.info("[LocalStorage] uploadRoot={}", uploadRoot); // 업로드경로 확인 가능
        }
        
    // 파일 저장
    public String save(MultipartFile file) throws IOException {
    	 return save(file,null);
        }
    
    public String save(MultipartFile file, String subDir) throws IOException {
        if (file == null || file.isEmpty()) {
            return null;
        } // save(file) 내부에서 save(file,null) 호출
          // save(file, String subDir) 서브 디렉터리 지정 가능
        
        // 실제 파일이 저장될 물리 경로
        String dirPath ;
        if (subDir != null && !subDir.isBlank()) {
            dirPath = uploadRoot + File.separator + subDir;
        } else {
            dirPath = uploadRoot;
        }

      
        File dir = new File(dirPath);

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
        file.transferTo(target); // 업로드된 파일을 실제 물리 파일로 저장

        String relativePath = dirPath.substring(uploadRoot.length()).replace("\\", "/");

        // subDir 가 없는 경우(dirPath == uploadRoot) ⇒ /uploads/파일명 형태로만 반환
        if (relativePath == null || relativePath.isBlank()) {
            String webPath = "/uploads/" + savedName;
            log.info("[LocalStorage] 저장 완료 webPath={}", webPath);
            return webPath;
        }

        if (!relativePath.startsWith("/")) {
            relativePath = "/" + relativePath;
        }

        String webPath = "/uploads" + relativePath + "/" + savedName;
        log.info("[LocalStorage] 저장 완료 webPath={}", webPath);
        return webPath;

    }

    // 파일 삭제
    public boolean delete(String relativeUrl) {
        if (relativeUrl == null || relativeUrl.isBlank()) {
            return false;
        }

        String path = relativeUrl.replace("\\", "/");

        // http(s) 외부 URL은 삭제 대상 아님
        if (path.startsWith("http://") || path.startsWith("https://")) {
            log.warn("[LocalStorage] 외부 URL은 삭제하지 않습니다: {}", path);
            return false;
        }

        // 기대 포맷: /uploads/.... 또는 uploads/....
        path = path.replaceFirst("^/?uploads/?", ""); // uploads/ 부분 제거
        File file = new File(uploadRoot, path.replace("/", File.separator));

        if (!file.exists()) {
            log.warn("[LocalStorage] 삭제 대상 파일이 없습니다: {}", file.getAbsolutePath());
            return false;
        }

        boolean deleted = file.delete();
        log.info("[LocalStorage] 파일 삭제 {}: {}", deleted ? "성공" : "실패", file.getAbsolutePath());
        return deleted;
    }

}
