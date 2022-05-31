import { Router } from "express";
import is from "@sindresorhus/is";
// 폴더에서 import하면, 자동으로 폴더의 index.js에서 가져옴
import { loginRequired } from "../middlewares";
import { orderService } from "../services";

const orderRouter = Router();

// 주문하기 api (아래는 /complete이지만, 실제로는 /api/order/complete로 요청해야 함.)
orderRouter.post("/complete", loginRequired, async (req, res, next) => {
  try {
    // Content-Type: application/json 설정을 안 한 경우, 에러를 만들도록 함.
    // application/json 설정을 프론트에서 안 하면, body가 비어 있게 됨.
    if (is.emptyObject(req.body)) {
      throw new Error(
        "headers의 Content-Type을 application/json으로 설정해주세요"
      );
    }

    const userId = req.currentUserId;
    // req (request)의 body 에서 데이터 가져오기

    const {
      fullName,
      phoneNumber,
      addressName,
      receiverName,
      receiverPhoneNumber,
      postalCode,
      address1,
      address2,
      request,
      orderList,
      totalPrice,
      shippingFee,
    } = req.body;

    const address = {
      addressName,
      receiverName,
      receiverPhoneNumber,
      postalCode,
      address1,
      address2,
    };
    const wholeorderList = Object.values(orderList).map((e) => ({
      productId: e.productId,
      title: e.title,
      quantity: e.quantity,
      price: e.price,
      status: e.status,
    }));

    // 위 데이터를 주문 db에 추가하기
    const newOrder = await orderService.addOrder({
      userId,
      fullName,
      phoneNumber,
      address,
      request,
      orderList: wholeorderList,
      totalPrice,
      shippingFee,
    });

    // 추가된 주문 db 데이터를 프론트에 다시 보내줌
    // 물론 프론트에서 안 쓸 수도 있지만, 편의상 일단 보내 줌
    res.status(201).json(newOrder);
  } catch (error) {
    next(error);
  }
});

// 내 주문 목록 보기 api (아래는 /:userId 이지만, 실제로는 /api/order/:userId로 요청해야 함.)
orderRouter.get("/orderList", loginRequired, async function (req, res, next) {
  try {
    const userId = req.currentUserId;

    const orderInfo = await orderService.getOrders(userId);

    res.status(200).json(orderInfo);
  } catch (error) {
    next(error);
  }
});

orderRouter.delete("/delete", loginRequired, async function (req, res, next) {
  try {
    const { orderIdList } = req.body; // 배열
    const userId = req.currentUserId;

    const orderList = await orderService.getOrdersForDelete(orderIdList);
    orderList.map((orderInfo) => {
      if (userId !== orderInfo.userId) {
        throw new Error("본인의 주문 내역만 취소할 수 있습니다.");
      }
    });
    const orderDeleteRequired = orderIdList;

    const deleteOrderInfo = await orderService.deleteOrder(orderDeleteRequired);
    console.log("삭제 완료");

    res.status(200).json(deleteOrderInfo);
  } catch (error) {
    next(error);
  }
});

export { orderRouter };
