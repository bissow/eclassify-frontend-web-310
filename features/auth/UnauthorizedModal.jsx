import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useTranslation } from "@/lang/useTranslation";
import { getIsUnauthorized, setIsUnauthorized } from "@/store/slices/globalStateSlice";
import { useDispatch, useSelector } from "react-redux";

const UnauthorizedModal = () => {
  const dispatch = useDispatch();
  const open = useSelector(getIsUnauthorized);
  const { t } = useTranslation();

  const handleOk = () => {
    dispatch(setIsUnauthorized(false));
  };

  return (
    <AlertDialog open={open}>
      <AlertDialogContent onInteractOutside={(e) => e.preventDefault()}>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('unauthorised')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('doNotHavePermission')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={handleOk}>{t('ok')}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default UnauthorizedModal;
