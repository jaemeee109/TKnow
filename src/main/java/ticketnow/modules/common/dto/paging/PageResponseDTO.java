package ticketnow.modules.common.dto.paging;

import lombok.Getter;
import lombok.Setter;
import java.util.List;


@Getter @Setter
public class PageResponseDTO<T> {
	
    // 실제 데이터 목록 
    private List<T> list;
    // 전체 행 수 
    private long totalCount;
    // 현재 페이지(요청의 page 그대로) 
    private int page;
    // 페이지당 크기(요청의 size 그대로) 
    private int size;

    // 전체 페이지 수 = ceil(totalCount / size) 
    public long getTotalPages() {
        if (size <= 0) return 0;
        return (totalCount + size - 1) / size;
    }

    public boolean isHasPrev() {
        return page > 1;
    }

    public boolean isHasNext() {
        return page < getTotalPages();
    }
}
