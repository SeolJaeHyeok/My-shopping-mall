import header from "/components/Header.js";
import * as Api from "/api.js";

document.body.insertAdjacentElement("afterbegin", header);

const categoryForm = document.querySelector("#registerCategoryForm");
const imageInput = document.querySelector("#imageInput");
const fileNameSpan = document.querySelector("#fileNameSpan");
const descriptionInput = document.getElementById("descriptionInput");
const titleInput = document.getElementById("titleInput");
const addCategoryButton = document.getElementById("addCategoryButton");
const contentTitle = document.getElementById("content-title");
const contentSubtitle = document.getElementById("content-subtitle");

const url = new URL(location.href).searchParams;
const categoryId = url.get("category");

// 카테고리 수정하기 화면 처리
const editProcess = async () => {
  const categoryInfo = await Api.get(`/api/category/${categoryId}`);
  titleInput.value = categoryInfo.name;
  descriptionInput.value = categoryInfo.description;
  addCategoryButton.innerText = "카테고리 수정하기";
  contentTitle.innerText = "카테고리 수정";
  contentSubtitle.innerText = "카테고리 수정하기";
};

// URL에 카테고리 아이디가 있다면 수정 없다면 추가
if (categoryId) {
  editProcess();
}

const request = async (req, formData) => {
  let apiUrl;
  req === "POST"
    ? (apiUrl = "/api/category/add")
    : (apiUrl = `/api/category/${categoryId}/update`);

  // 카테고리 추가 또는 수정 요청
  await fetch(`${apiUrl}`, {
    method: req,
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: formData,
  })
    .then((res) => res.json())
    .then((result) => {
      if (result.result === "error") {
        location.reload();
        return alert(result.reason);
      }
      location.href = "/category/edit";
      alert("카테고리가 정상적으로 추가되었습니다.");
    });
};

const handleSubmit = async (e) => {
  e.preventDefault();

  const formData = new FormData(categoryForm);

  categoryId ? request("PUT", formData) : request("POST", formData);
};

const handleUpload = () => {
  fileNameSpan.textContent = imageInput.files[0].name;
};

categoryForm.addEventListener("submit", handleSubmit);
imageInput.addEventListener("change", handleUpload);
