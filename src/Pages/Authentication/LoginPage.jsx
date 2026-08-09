import { useEffect, useState } from "react";
import {
  EmailInput,
  LoaderLogin,
  PasswordInput,
  SubmitButton,
} from "../../Components/Components";
import LoginBackground from "../../Assets/Images/LoginBackground";
import { useAuth } from "../../Context/Auth";
import { useNavigate } from "react-router-dom";
import { usePost } from "../../Hooks/usePostJson";
import { useDispatch } from "react-redux";
import { setUser } from "../../Store/CreateSlices";
import { useTranslation } from "react-i18next";
import { requestPermission } from "../../NotificationHelper";

const LoginPage = () => {
  const { t } = useTranslation();

  const auth = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  const { postData, loadingPost, response } = usePost({
    url: `${apiUrl}/api/admin/auth/login`,
  });

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email) {
      auth.toastError(t("Please Enter The Email"));
      return;
    }
    if (!password) {
      auth.toastError(t("Please Enter The Password"));
      return;
    }

    const fcmToken = await requestPermission();

    const payload = {
      email,
      password,
      fcm_token: fcmToken || null,
    };

    postData(payload);
  };

  useEffect(() => {
    if (response) {

      const adminData = {
        ...response.data.admin,
        order_lang: response.data.order_lang,
        r_online_noti: response.data.r_online_noti,
        receipt_design: response.data.receipt_design
      };

      auth.login(adminData);

      const userRole = response.data.role;

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("role", response.data.role);

      if (userRole === "admin") {
        navigate("/dashboard", { replace: true });
      } else if (userRole === "branch") {
        navigate("/branch", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    }
  }, [response]);

  return (
    <>
      <form
        onSubmit={handleLogin}
        className="flex items-center justify-center w-full h-screen mx-auto overflow-hidden"
      >
        <div className="flex items-start justify-between w-11/12 h-5/6">
          <div className="flex flex-col items-start justify-start h-full sm:w-full xl:w-5/12 gap-y-8">
            {loadingPost ? (
              <div className="w-full h-full">
                <LoaderLogin />
              </div>
            ) : (
              <>
                <div className="flex flex-col items-start justify-start w-full gap-y-4">
                  <span className="sm:text-4xl xl:text-5xl font-TextFontRegular text-secoundColor">
                    {t("Loginto")} {t("projectName")}
                  </span>
                  <span className="sm:text-4xl xl:text-5xl font-TextFontRegular text-secoundColor">
                    {t("welcomeback")}
                  </span>
                </div>

                <div className="flex flex-col justify-center w-full gap-y-10 h-3/5">
                  <div className="flex flex-col justify-center w-full gap-y-6">
                    <div className="w-11/12 mx-auto">
                      <EmailInput
                        value={email}
                        required={false}
                        placeholder={t("Email")}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>

                    <div className="w-11/12 mx-auto">
                      <PasswordInput
                        value={password}
                        placeholder={t("Password")}
                        required={false}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="w-11/12 mx-auto">
                    {/* SubmitButton no longer needs handleClick */}
                    <SubmitButton text={t("Login")} />
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="items-center justify-center w-2/4 h-full sm:hidden xl:flex">
            <LoginBackground height="100%" />
          </div>
        </div>
      </form>
    </>
  );
};

export default LoginPage;
