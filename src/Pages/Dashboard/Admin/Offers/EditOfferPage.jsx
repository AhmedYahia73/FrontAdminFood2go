import React, { useEffect, useRef, useState } from "react";
import { useGet } from "../../../../Hooks/useGet";
import { usePost } from "../../../../Hooks/usePostJson";
import { useNavigate, useParams } from "react-router-dom";
import {
  LoaderLogin,
  NumberInput,
  StaticButton,
  SubmitButton,
  TextInput,
  UploadInput,
} from "../../../../Components/Components";
import { useAuth } from "../../../../Context/Auth";
import { useTranslation } from "react-i18next";

const EditOfferPage = () => {
  const { offerId } = useParams();
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const {
    refetch: refetchTranslation,
    loading: loadingTranslation,
    data: dataTranslation,
  } = useGet({
    url: `${apiUrl}/admin/translation`,
  });
  const {
    refetch: refetchOffer,
    loading: loadingOffer,
    data: dataOffer,
  } = useGet({ url: `${apiUrl}/admin/offer/item/${offerId}` });
  const { postData, loadingPost, response } = usePost({
    url: `${apiUrl}/admin/offer/update/${offerId}`,
  });
  const { t, i18n } = useTranslation();

  const ImageRef = useRef();
  const auth = useAuth();
  const navigate = useNavigate();

  const [taps, setTaps] = useState([]);
  const [currentTap, setCurrentTap] = useState(0);

  const [offerNames, setOfferNames] = useState([]);
  const [points, setPoints] = useState("");

  const [image, setImage] = useState("");
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    refetchTranslation(); // Refetch data when the component mounts
    refetchOffer(); // Refetch data when the component mounts
  }, [refetchTranslation, refetchOffer]);

  useEffect(() => {
    if (dataTranslation) {
      setTaps(dataTranslation.translation);
    }
  }, [dataTranslation]);

  useEffect(() => {
    if (dataOffer && dataOffer.offer) {
      const newOfferNames = [];
      if (dataOffer.offer.offer_names) {
        dataOffer.offer.offer_names.forEach((offer) => {
          let obj = {
            tranlation_id: offer.tranlation_id || "-", // Use '' if id is missing
            tranlation_name: offer.tranlation_name || "Default Language", // Fallback value
            offer_product: offer.offer_product || "-", // Use '' if name is missing
          };
          newOfferNames.push(obj);
        });
      }
      setOfferNames(newOfferNames.length > 0 ? newOfferNames : []);
      setPoints(dataOffer?.offer?.points || points);
      setImage(dataOffer?.offer?.image_link || image);
      setImageFile(dataOffer?.offer?.image_link || imageFile);
    }
  }, [dataOffer]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImage(file.name);
    }
  };
  const handleImageClick = (ref) => {
    if (ref.current) {
      ref.current.click();
    }
  };

  const handleTap = (index) => {
    setCurrentTap(index);
  };

  useEffect(() => {
    if (!loadingPost && response) {
      handleCancel();
    }
  }, [loadingPost, response]);

  const handleCancel = () => {
    navigate(-1, { replace: true });
  };

  const handleOfferEdit = (e) => {
    e.preventDefault();

    if (offerNames.length === 0) {
      auth.toastError(t("offerNames")); // الترجمة لرسالة "من فضلك أدخل أسماء العروض"
      return;
    }
    // if (offerNames.length !== taps.length) {
    //        auth.toastError('please Enter All Offer Names')
    //        return;
    // }

    if (!imageFile) {
      auth.toastError(t("offerImage")); // الترجمة لرسالة "من فضلك ضع صورة العرض"
      return;
    }
    const formData = new FormData();

    offerNames.forEach((name, index) => {
      // Corrected the typo and added translation_id and translation_name
      formData.append(
        `offer_names[${index}][offer_product]`,
        name.offer_product
      );
      formData.append(
        `offer_names[${index}][tranlation_id]`,
        name.translation_id
      );
      formData.append(
        `offer_names[${index}][tranlation_name]`,
        name.translation_name
      );
    });

    formData.append("points", points);
    formData.append("image", imageFile);

    postData(formData, t("Offer Added Success"));
  };
  return (
    <>
      {loadingTranslation || loadingOffer || loadingPost ? (
        <>
          <div className="flex items-center justify-center w-full">
            <LoaderLogin />
          </div>
        </>
      ) : (
        <section>
          <form onSubmit={handleOfferEdit}>
            {/* Taps */}
            <div className="flex items-center justify-start w-full py-2 gap-x-6">
              {taps.map((tap, index) => (
                <span
                  key={tap.id}
                  onClick={() => handleTap(index)}
                  className={`${
                    currentTap === index
                      ? "text-mainColor border-b-4 border-mainColor"
                      : "text-thirdColor"
                  }  pb-1 text - xl font - TextFontMedium transition - colors duration - 300 cursor - pointer hover: text - mainColor`}
                >
                  {tap.name}
                </span>
              ))}
            </div>
            {/* Content*/}
            <div className="sm:py-3 lg:py-6">
              {taps.map(
                (tap, index) =>
                  currentTap === index && (
                    <div
                      className="flex flex-wrap items-center justify-start w-full gap-4 sm:flex-col lg:flex-row"
                      key={tap.id}
                    >
                      {/* Name Input */}
                      <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
                        <span className="text-xl font-TextFontRegular text-thirdColor">
                          {t("Name")} {tap.name}:
                        </span>
                        <TextInput
                          value={offerNames[index]?.offer_product} // Access offer_product property
                          onChange={(e) => {
                            const inputValue = e.target.value; // Ensure this is a string
                            setOfferNames((prev) => {
                              const updatedNames = [...prev];

                              // Ensure the array is long enough
                              if (updatedNames.length <= index) {
                                updatedNames.length = index + 1; // Resize array
                              }

                              // Create or update the object at the current index
                              updatedNames[index] = {
                                ...updatedNames[index], // Retain existing properties if any
                                tranlation_id: tap.id, // Use the ID from tap
                                offer_product: inputValue, // Use the captured string value
                                tranlation_name: tap.name || "Default Name", // Use tap.name for tranlation_name
                              };

                              return updatedNames;
                            });
                          }}
                          placeholder={t("OfferName")}
                        />
                      </div>

                      {/* Conditional Rendering for First Tab Only */}
                      {currentTap === 0 && (
                        <>
                          <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
                            <span className="text-xl font-TextFontRegular text-thirdColor">
                              {t("Points")} :
                            </span>
                            <NumberInput
                              value={points} // Access addon_name property
                              onChange={(e) => setPoints(e.target.value)}
                              placeholder={t("Points")}
                            />
                          </div>
                          {/* Category Image */}
                          <div className="sm:w-full lg:w-[30%] flex flex-col items-start justify-center gap-y-1">
                            <span className="text-xl font-TextFontRegular text-thirdColor">
                              {t("OfferImage")}:
                            </span>
                            <UploadInput
                              value={image}
                              uploadFileRef={ImageRef}
                              placeholder={t("OfferImage")}
                              handleFileChange={handleImageChange}
                              onChange={(e) => setImage(e.target.value)}
                              onClick={() => handleImageClick(ImageRef)}
                            />
                          </div>
                        </>
                      )}
                    </div>
                  )
              )}
            </div>

            {/* Buttons*/}
            <div className="flex items-center justify-end w-full gap-x-4">
              <div className="">
                <StaticButton
                  text={t("Cancel")}
                  handleClick={handleCancel}
                  bgColor="bg-transparent"
                  Color="text-mainColor"
                  border={"border-2"}
                  borderColor={"border-mainColor"}
                  rounded="rounded-full"
                />
              </div>
              <div className="">
                <SubmitButton
                  text={t("Edit")}
                  rounded="rounded-full"
                  handleClick={handleOfferEdit}
                />
              </div>
            </div>
          </form>
        </section>
      )}
    </>
  );
};

export default EditOfferPage;
