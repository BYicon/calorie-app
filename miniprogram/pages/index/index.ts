import { login } from "../../api/login";

Page({
  data: {
  },
  onload() {
    console.log("onLoad 🚀🚀🚀");
    login();
  }
})