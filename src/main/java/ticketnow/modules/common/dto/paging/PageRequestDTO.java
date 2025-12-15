package ticketnow.modules.common.dto.paging;

import lombok.Getter;
import lombok.Setter;


@Getter @Setter
public class PageRequestDTO {
	
   // 현재 페이지(1부터 시작). 미지정 시 1페이지 
    private int page = 1;

    //  페이지당 행 수. 미지정 시 10
    private int size = 10;

    // LIMIT 에 들어갈 row 수 = size 
    public int getLimit() {
        return size < 1 ? 10 : size;
    }

    // OFFSET = (page - 1) * size (page가 1보다 작으면 0으로 보정) 
    public int getOffset() {
        int p = page < 1 ? 1 : page;
        int s = size < 1 ? 10 : size;
        return (p - 1) * s;
    }
}