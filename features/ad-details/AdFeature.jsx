import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/lang/useTranslation";
import { isPdf } from "@/lib/media";
import CustomLink from "@/components/common/CustomLink";
import CustomImage from "@/components/common/CustomImage";
import { LightbulbIcon, LinkIcon } from "@phosphor-icons/react";

const AdFeature = ({ filteredFields }) => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-2 bg-muted rounded-lg">
      <div className="flex flex-col gap-2 p-4">
        <div>
          <Badge className="bg-primary rounded-sm gap-1 text-base  text-white py-2 px-4">
            <LightbulbIcon size={16} weight="bold" />
            {t("highlights")}
          </Badge>
        </div>
        <div className="flex flex-col gap-6 items-start mt-6">
          {filteredFields?.map((feature, index) => {
            return (
              <div className="flex items-center gap-2 md:gap-3 w-full" key={index}>
                <div className="flex items-center gap-2 w-6/12 sm:w-4/12">
                  <CustomImage
                    src={feature?.image}
                    alt={feature?.translated_name || feature?.name}
                    height={24}
                    width={24}
                    className="aspect-square size-6"
                  />
                  <p className="text-base font-medium text-wrap">
                    {feature?.translated_name || feature?.name}
                  </p>
                </div>

                <div className="flex items-center gap-2 sm:gap-4 w-6/12 sm:w-8/12">
                  <span className="hidden md:inline">:</span>
                  {feature.type === "fileinput" ? (
                    isPdf(feature?.value?.[0]) ? (
                      <div className="flex gap-1 items-center">
                        <LinkIcon size={20} weight="bold" />
                        <CustomLink
                          href={feature?.value?.[0]}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {t("viewPdf")}
                        </CustomLink>
                      </div>
                    ) : (
                      <CustomLink
                        href={feature?.value}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <CustomImage
                          src={feature?.value}
                          alt="Preview"
                          width={36}
                          height={36}
                        />
                      </CustomLink>
                    )
                  ) : (
                    <p className="text-base text-muted-foreground w-full break-all">
                      {Array.isArray(feature?.translated_value)
                        ? feature?.translated_value.join(", ")
                        : feature?.translated_value}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdFeature;
