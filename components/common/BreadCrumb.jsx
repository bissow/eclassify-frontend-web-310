"use client";
import { Fragment } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useSearchParams } from "next/navigation";
import CustomLink from "@/components/common/CustomLink";
import { knownParams } from "@/lib/constants";
import { useTranslation } from "@/lang/useTranslation";


const BreadCrumb = ({ items = [] }) => {
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const query = new URLSearchParams(
    [...searchParams].filter(([key]) => knownParams.includes(key))
  ).toString();

  const crumbs = [
    { name: t("home"), href: "/" },
    ...items
      .filter((crumb) => crumb.name || crumb.nameKey)
      .map((crumb) => ({
        ...crumb,
        href: crumb.href && query ? `${crumb.href}?${query}` : crumb.href,
      })),
  ];

  return (
    <div className="bg-muted">
      <div className="container py-5">
        <Breadcrumb>
          <BreadcrumbList>
            {crumbs.map((crumb, index) => {
              const isLast = index === crumbs.length - 1;
              const name = crumb.name ?? t(crumb.nameKey);

              return (
                <Fragment key={index}>
                  <BreadcrumbItem>
                    {crumb.href && !isLast ? (
                      <CustomLink href={crumb.href} passHref>
                        <BreadcrumbLink asChild className="text-black">
                          <span>{name}</span>
                        </BreadcrumbLink>
                      </CustomLink>
                    ) : (
                      <p className="text-black">{name}</p>
                    )}
                  </BreadcrumbItem>
                  {!isLast && <BreadcrumbSeparator />}
                </Fragment>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </div>
  );
};

export default BreadCrumb;
