"use client";
import { useTranslation } from "@/lang/useTranslation";
import Arrow from "@/public/assets/Arrow.svg";
import { useSelector } from "react-redux";
import { settingsData } from "@/store/slices/settingSlice";
import CustomImage from "@/components/common/CustomImage";
import { workProcessSteps } from "@/lib/constants";

const WorkProcess = () => {
  const { t } = useTranslation();
  const settings = useSelector(settingsData);

  return (
    <section className="py-28" id="work_process">
      <div className="container">
        <div className="flex items-center flex-col gap-6">
          <p className="outlinedSecHead">
            {t("how")} {settings?.company_name} {t("getsYouResults")}
          </p>
          <h1 className="landingSecHeader">
            {t("unravelingThe")} {settings?.company_name} <br />{" "}
            {t("workProcess")}
          </h1>
        </div>
        <div className="mt-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            {workProcessSteps.map((step, index) => (
              <div
                key={step.id}
                className="flex flex-col items-center gap-4 relative"
              >
                {index !== workProcessSteps.length - 1 && (
                  <CustomImage
                    src={Arrow}
                    alt="arrow"
                    width={128}
                    height={22}
                    className="absolute hidden w-32 top-[5%] lg:block lg:-right-[34%] xl:-right-[30%] 2xl:-right-[25%] rtl:right-auto lg:rtl:-left-[34%] xl:rtl:-left-[30%] 2xl:rtl:-left-[25%] rtl:scale-x-[-1]"
                  />
                )}
                <span className="flex items-center justify-center text-white font-bold w-[40px] h-[40px] bg-primary rounded-full">
                  {step.id}
                </span>
                <h5 className="font-bold">{t(step.title)}</h5>
                <p>{t(step.description)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WorkProcess;
