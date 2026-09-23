import { useEffect, useState } from "react";
import { getChatTemplateQuestionsApi } from "@/lib/api";

const useChatTemplateQuestions = (itemId) => {
  const [replies, setReplies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchQuestions = async () => {
      if (!itemId) {
        setReplies([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await getChatTemplateQuestionsApi.getSettings({ item_id: itemId });
        setReplies(
          !response?.data?.error && Array.isArray(response?.data?.data)
            ? response.data.data
            : []
        );
      } catch (error) {
        console.error(error);
        setReplies([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestions();
  }, [itemId]);

  return { replies, isLoading };
};

export default useChatTemplateQuestions;
