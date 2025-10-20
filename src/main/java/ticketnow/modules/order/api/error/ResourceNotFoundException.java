package ticketnow.modules.order.api.error;

// 주문을 찾을 수 없을때 사용하는 런타임 예외
public class ResourceNotFoundException extends RuntimeException {
	
	    public ResourceNotFoundException(String msg) { super(msg); }
	    
}
