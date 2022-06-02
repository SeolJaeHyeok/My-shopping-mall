import { Router } from "express";
// 폴더에서 import하면, 자동으로 폴더의 index.js에서 가져옴
import { loginRequired } from "../middlewares";
import { productService } from "../services";
import { upload } from "../middlewares";
import { contentTypeChecker } from "../utils/content-type-checker";
const productRouter = Router();

// 전체 상품 가져오기
productRouter.get("/", async function (req, res, next) {
  try {
    // 전체 사용자 목록을 얻음
    const products = await productService.getProducts();
    // 사용자 목록(배열)을 JSON 형태로 프론트에 보냄
    res.status(200).json(products);
  } catch (error) {
    next(error);
  }
});

//상품 상세 페이지
productRouter.get("/:id", async function (req, res, next) {
  try {
    const productId = req.params.id;
    const productInfo = await productService.getProductByProductId(productId);
    // 상품 스키마를 JSON 형태로 프론트에 보냄
    res.status(200).json(productInfo);
  } catch (error) {
    next(error);
  }
});

//상품 수정 위해 상품 데이터 보내기
productRouter.get(
  "/:id/update",
  loginRequired,
  async function (req, res, next) {
    try {
      const userId = req.currentUserId;
      const productId = req.params.id;
      const productInfo = await productService.getProductForUpdate(
        productId,
        userId
      );
      // 상품 스키마를 JSON 형태로 프론트에 보냄
      res.status(200).json(productInfo);
    } catch (error) {
      next(error);
    }
  }
);

//상품 정보 수정
productRouter.put(
  "/:id/update",
  loginRequired,
  upload.single("image-file"),
  async function (req, res, next) {
    try {
      contentTypeChecker(req.body);
      const userId = req.currentUserId;
      const productId = req.params.id;
      const { location: img } = req.file;
      const {
        name,
        price,
        category,
        quantity,
        brandName,
        keyword,
        shortDescription,
        detailDescription,
      } = req.body;

      const toUpdate = {
        ...(img && { img }),
        ...(name && { name }),
        ...(price && { price }),
        ...(category && { category }),
        ...(quantity && { quantity }),
        ...(brandName && { brandName }),
        ...(keyword && { keyword }),
        ...(shortDescription && { shortDescription }),
        ...(detailDescription && { detailDescription }),
      };

      // 상품 정보를 업데이트함.
      const updatedProductInfo = await productService.setProduct(
        userId,
        productId,
        toUpdate
      );
      res.status(200).json(updatedProductInfo);
    } catch (error) {
      next(error);
    }
  }
);

// 상품 업로드 api
productRouter.post(
  "/add",
  upload.single("image-file"),
  loginRequired,
  async (req, res, next) => {
    try {
      contentTypeChecker(req.body);
      const userId = req.currentUserId;
      const { location: img } = req.file;
      const {
        name,
        price,
        category,
        quantity,
        brandName,
        keyword,
        shortDescription,
        detailDescription,
      } = req.body;

      // 위 데이터를 유저 db에 추가하기
      const newProduct = await productService.addProduct({
        name,
        price,
        img,
        category,
        quantity,
        brandName,
        keyword,
        shortDescription,
        detailDescription,
        userId,
      });

      // 추가된 유저의 db 데이터를 프론트에 다시 보내줌
      // 물론 프론트에서 안 쓸 수도 있지만, 편의상 일단 보내 줌
      res.status(201).json(newProduct);
    } catch (error) {
      next(error);
    }
  }
);

//상품 판매 삭제 기능
productRouter.delete("/delete", loginRequired, async function (req, res, next) {
  try {
    contentTypeChecker(req.body);

    const productIdList = req.body.productIdList;
    const userId = req.currentUserId;

    await productService.checkProductsForDelete(userId, productIdList);

    const deleteProductInfo = await productService.deleteProduct(productIdList);
    res.status(200).json(deleteProductInfo);
  } catch (error) {
    next(error);
  }
});

// 카테고리에 맞는 상품 api
productRouter.get("/category/:category", async (req, res, next) => {
  try {
    const category = req.params.category;

    // 특정 카테고리에 맞는 상품 목록을 얻음
    const products = await productService.getProductsByCategory(category);
    // 상품 목록(배열)을 JSON 형태로 프론트에 보냄
    res.status(200).json(products);
  } catch (error) {
    next(error);
  }
});

export { productRouter };
