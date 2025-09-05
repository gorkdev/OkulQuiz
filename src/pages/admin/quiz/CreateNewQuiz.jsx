import React, { useEffect, useState, useMemo } from "react";
import AdminHeader from "../../../components/AdminHeader/AdminHeader";
import { getCategoriesPaginated } from "../../../services/mysql/categoryService";
import { getQuestionsByCategoryPaginated } from "../../../services/mysql/questionService";
import CustomCheckbox from "../../../components/FormTemplate/CustomCheckbox";
import FormField from "../../../components/FormTemplate/FormField";
import Loader from "../../../components/Loader";
import { motion, AnimatePresence } from "framer-motion";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import {
  FiSearch,
  FiChevronDown,
  FiChevronRight,
  FiCheckCircle,
} from "react-icons/fi";
import { MdDragIndicator } from "react-icons/md";
import { RiDragMove2Fill } from "react-icons/ri";

import { useDrop, useDrag } from "react-dnd";
import { ItemTypes } from "./ItemTypes";
import { addQuiz } from "../../../services/mysql/quizService";
import { toast } from "react-toastify";

const CATEGORY_PANEL_WIDTH = "w-96";

const CategoryQuestions = ({
  categoryId,
  selectedQuestions,
  onSelect,
  search,
  setSearch,
}) => {
  // Sayfalı olarak soruları çek (MySQL)
  const fetchQuestions = async (page, pageSize) => {
    const resp = await getQuestionsByCategoryPaginated(
      categoryId,
      page,
      pageSize
    );
    const list = resp?.questions || resp?.data?.questions || [];
    return list;
  };
  const [questions, setQuestions] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [firstLoaded, setFirstLoaded] = useState(false);

  // Arama veya kategori değişince resetle
  useEffect(() => {
    setQuestions([]);
    setPage(1);
    setHasMore(true);
    setFirstLoaded(false);
  }, [categoryId, search]);

  // Soru yükle
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      const qs = await fetchQuestions(page, 10);
      if (!cancelled) {
        setQuestions((prev) => (page === 1 ? qs : [...prev, ...qs]));
        setHasMore(qs.length === 10);
        setIsLoading(false);
        if (page === 1) setFirstLoaded(true);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line
  }, [page, categoryId, search]);

  // Scroll ile yeni sayfa yükle
  const listRef = React.useRef();
  useEffect(() => {
    if (!hasMore || isLoading) return;
    const handleScroll = () => {
      if (!listRef.current) return;
      const { scrollTop, scrollHeight, clientHeight } = listRef.current;
      if (scrollTop + clientHeight >= scrollHeight - 100) {
        setPage((p) => p + 1);
      }
    };
    const el = listRef.current;
    el && el.addEventListener("scroll", handleScroll);
    return () => el && el.removeEventListener("scroll", handleScroll);
  }, [hasMore, isLoading]);

  // Arama filtrelemesi
  const filteredQuestions = useMemo(() => {
    if (!search) return questions;
    const term = search.toLowerCase();
    return questions.filter((q) =>
      (q.soruMetni || q.soru_metni || "").toLowerCase().includes(term)
    );
  }, [questions, search]);

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className="overflow-hidden"
    >
      <div className="p-4 bg-white rounded-b-xl border-t border-gray-200 min-h-[180px] w-full">
        <div className="flex items-center gap-2 mb-3">
          <FiSearch className="text-gray-400" />
          <input
            type="text"
            placeholder="Soru ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-blue-400 outline-none bg-white"
          />
        </div>
        <div
          ref={listRef}
          className="max-h-72 overflow-y-auto flex flex-col gap-3 pr-1 w-full scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-blue-50"
        >
          {!firstLoaded && isLoading && <Loader className="h-24" />}
          {firstLoaded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="w-full"
            >
              {filteredQuestions.map((q) => {
                const isChecked = selectedQuestions.some(
                  (sq) => sq.id === q.id
                );
                // Zorluk, puan, süre için düz metin hazırla
                const zorlukMap = {
                  easy: "kolay",
                  medium: "orta",
                  hard: "zor",
                };
                const zorluk = zorlukMap[q.zorluk] || q.zorluk || "-";
                const puan =
                  q.puan ?? q.puan_degeri
                    ? `${q.puan ?? q.puan_degeri} puan`
                    : "- puan";
                const sure =
                  q.sure ?? q.sure_saniye
                    ? `${q.sure ?? q.sure_saniye} sn`
                    : "- sn";
                return (
                  <motion.div
                    key={q.id}
                    layout
                    transition={{ type: "spring", stiffness: 700, damping: 30 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className={`mb-2 w-full min-w-0 max-w-full flex items-stretch border ${
                      isChecked
                        ? "border-blue-500"
                        : "border-gray-200 hover:border-blue-200"
                    } bg-white rounded-xl shadow-xs transition-all duration-150 cursor-pointer`}
                    style={{ maxWidth: "100%" }}
                    onClick={() => onSelect(q)}
                  >
                    {/* Checkbox sol, dikey ortalanmış */}
                    <div className="flex items-center px-4">
                      <CustomCheckbox
                        checked={isChecked}
                        onChange={() => onSelect(q)}
                        label={null}
                      />
                    </div>
                    {/* Soru metni ve info */}
                    <div className="flex flex-col flex-1 justify-center py-3 pr-6 min-w-0">
                      <span
                        className="font-semibold text-gray-900 text-base md:text-lg leading-tight w-full text-ellipsis overflow-hidden whitespace-nowrap min-w-0"
                        title={q.soruMetni || q.soru_metni}
                      >
                        {q.soruMetni || q.soru_metni}
                      </span>
                      <span className="text-xs text-gray-500 mt-1">
                        {zorluk} • {puan} • {sure}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
              {isLoading && <Loader className="h-24" />}
              {!isLoading && filteredQuestions.length === 0 && (
                <div className="text-center text-gray-400 py-8">
                  Soru bulunamadı.
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// DND sabiti
// const ItemTypes = { CATEGORY: "category", QUESTION: "question" }; // <-- Bunu kaldırıyorum

// Soru kartı (drag & drop)
const QuestionDndCard = ({
  id,
  index,
  text,
  moveCard,
  categoryId,
  ...rest
}) => {
  const ref = React.useRef(null);
  const [{ handlerId }, drop] = useDrop({
    accept: ItemTypes.QUESTION,
    collect(monitor) {
      return { handlerId: monitor.getHandlerId() };
    },
    hover(item, monitor) {
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;
      // Determine rectangle on screen
      const hoverBoundingRect = ref.current.getBoundingClientRect();
      // Get vertical middle
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      // Determine mouse position
      const clientOffset = monitor.getClientOffset();
      // Get pixels to the top
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;
      // Only perform the move when the mouse has crossed half of the items height
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;
      moveCard(categoryId, dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.QUESTION,
    item: { id, index, categoryId },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  });
  drag(drop(ref));
  return (
    <div
      ref={ref}
      style={{ opacity: isDragging ? 0.5 : 1 }}
      data-handler-id={handlerId}
      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-100 border border-blue-300 shadow-sm transition-all w-full min-w-0 max-w-lg h-16 mb-2 cursor-move"
      {...rest}
    >
      <span className="text-lg text-blue-700 flex items-center">
        <RiDragMove2Fill size={20} />
      </span>
      <span className="font-medium text-gray-800 truncate min-w-0 max-w-full block">
        {text}
      </span>
    </div>
  );
};

// Kategori container (drag & drop)
const CategoryDndContainer = ({
  id,
  index,
  title,
  questions,
  moveCategory,
  moveQuestion,
}) => {
  const ref = React.useRef(null);
  const [{ handlerId }, drop] = useDrop({
    accept: ItemTypes.CATEGORY,
    collect(monitor) {
      return { handlerId: monitor.getHandlerId() };
    },
    hover(item, monitor) {
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;
      // Determine rectangle on screen
      const hoverBoundingRect = ref.current.getBoundingClientRect();
      // Get vertical middle
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      // Determine mouse position
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;
      // Get pixels to the top
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;
      // Only perform the move when the mouse has crossed half of the items height
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;
      moveCategory(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.CATEGORY,
    item: { id, index },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  });
  drag(drop(ref));
  return (
    <div
      ref={ref}
      style={{ opacity: isDragging ? 0.5 : 1 }}
      data-handler-id={handlerId}
      className="mb-8 bg-white rounded-xl border border-blue-200 p-4 h-[180px] flex flex-col"
    >
      <div className="font-bold text-lg text-blue-700 mb-2 flex items-center gap-2">
        <span className="text-lg text-blue-700 flex items-center cursor-move">
          <RiDragMove2Fill size={22} />
        </span>
        {title}
      </div>
      <div className="flex flex-col gap-1 overflow-y-auto flex-1">
        {questions.length === 0 ? (
          <div className="border-2 border-dotted border-blue-200 rounded-lg h-14 my-1"></div>
        ) : (
          questions
            .filter((q) => q && q.id)
            .map((q, idx) => (
              <QuestionDndCard
                key={q.id}
                id={q.id}
                index={idx}
                text={q.soruMetni || q.soru_metni}
                moveCard={moveQuestion}
                categoryId={id}
              />
            ))
        )}
      </div>
    </div>
  );
};

const CreateNewQuiz = () => {
  const [quizName, setQuizName] = useState("");
  const [questionOrderType, setQuestionOrderType] = useState("ordered"); // 'ordered' veya 'random'
  const [categoryOrderType, setCategoryOrderType] = useState("ordered"); // 'ordered' veya 'random'
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  // {catId: [{id, soruMetni}]}
  const [selectedQuestionsByCategory, setSelectedQuestionsByCategory] =
    useState({});
  const [categorySearch, setCategorySearch] = useState("");
  const [openCategory, setOpenCategory] = useState(null);
  const [questionSearch, setQuestionSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [selectedCategoryOrder, setSelectedCategoryOrder] = useState([]); // Sağ panelde kategori sırası

  // Kategorileri çek
  useEffect(() => {
    async function fetchCategories() {
      setCategoriesLoading(true);
      const res = await getCategoriesPaginated(1, 100);
      const list = res?.data?.categories || res?.categories || [];
      setCategories(Array.isArray(list) ? list : []);
      setCategoriesLoading(false);
    }
    fetchCategories();
  }, []);

  // Kategori arama
  const filteredCategories = useMemo(() => {
    if (!categorySearch) return categories;
    return categories.filter((cat) =>
      cat.kategori_adi.toLowerCase().includes(categorySearch.toLowerCase())
    );
  }, [categories, categorySearch]);

  // Soru seçimi
  const handleSelectQuestion = (catId, qObj) => {
    setSelectedQuestionsByCategory((prev) => {
      const arr = prev[catId] || [];
      const exists = arr.some((s) => s.id === qObj.id);
      const newArr = exists
        ? arr.filter((s) => s.id !== qObj.id)
        : [...arr, qObj];
      return {
        ...prev,
        [catId]: newArr,
      };
    });
    setSelectedCategoryOrder((prev) => {
      const arr = prev.includes(catId) ? prev : [...prev, catId];
      // Eğer kategoriye ait hiç soru kalmadıysa, kategoriyi çıkar
      const newArr = selectedQuestionsByCategory[catId] || [];
      const wasSelected = newArr.some((s) => s.id === qObj.id);
      // Seçim kaldırıldıysa ve yeniArr.length === 0 ise sil
      if (wasSelected && newArr.length === 1) {
        return arr.filter((id) => id !== catId);
      }
      // Seçim eklendiyse veya hala soru varsa, kategoriyi tut
      return arr;
    });
  };

  // Sağ panelde kategori drag-drop
  const onCategoryDragEnd = (result) => {
    if (!result.destination) return;
    const fromIdx = result.source.index;
    const toIdx = result.destination.index;
    if (fromIdx === toIdx) return;
    setSelectedCategoryOrder((prev) => {
      const arr = [...prev];
      const [removed] = arr.splice(fromIdx, 1);
      arr.splice(toIdx, 0, removed);
      return arr;
    });
  };

  // Sağ panelde soru drag-drop
  const onSelectedQuestionDragEnd = (catId) => (result) => {
    if (!result.destination) return;
    const fromIdx = result.source.index;
    const toIdx = result.destination.index;
    if (fromIdx === toIdx) return;
    setSelectedQuestionsByCategory((prev) => {
      const arr = [...(prev[catId] || [])];
      const [removed] = arr.splice(fromIdx, 1);
      arr.splice(toIdx, 0, removed);
      return { ...prev, [catId]: arr };
    });
  };

  // Quiz kaydetme
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    if (!quizName.trim()) return setError("Quiz adı zorunlu!");
    const selectedCats = Object.keys(selectedQuestionsByCategory).filter(
      (catId) => selectedQuestionsByCategory[catId]?.length > 0
    );
    if (selectedCats.length === 0)
      return setError("En az bir kategori ve soru seçmelisiniz!");
    setSaving(true);
    try {
      // Kategori sırası ve her kategori için soru id sırası hazırlanıyor
      const categoryOrder = selectedCategoryOrder.filter(
        (catId) => selectedQuestionsByCategory[catId]?.length > 0
      );
      const questionsByCategory = {};
      categoryOrder.forEach((catId) => {
        questionsByCategory[catId] = (
          selectedQuestionsByCategory[catId] || []
        ).map((q) => q.id);
      });
      // Yeni: kategori ve toplam soru sayısı hesapla
      const categoryCount = categoryOrder.length;
      const questionCount = categoryOrder.reduce(
        (acc, catId) => acc + (questionsByCategory[catId]?.length || 0),
        0
      );
      await addQuiz({
        quizName: quizName.trim(),
        categoryOrder,
        questionsByCategory,
        questionOrderType,
        categoryOrderType,
        categoryCount, // yeni
        questionCount, // yeni
      });
      setSuccess(true);
      toast.success("Quiz başarıyla kaydedildi!");
    } catch (err) {
      setError("Quiz kaydedilirken hata oluştu: " + (err?.message || err));
      toast.error("Quiz kaydedilirken hata oluştu: " + (err?.message || err));
    } finally {
      setSaving(false);
    }
  };

  // moveCategory ve moveQuestion fonksiyonlarını ekle
  const moveCategory = (fromIdx, toIdx) => {
    setSelectedCategoryOrder((prev) => {
      const arr = [...prev];
      const [removed] = arr.splice(fromIdx, 1);
      arr.splice(toIdx, 0, removed);
      return arr;
    });
  };
  const moveQuestion = (catId, fromIdx, toIdx) => {
    setSelectedQuestionsByCategory((prev) => {
      const arr = [...(prev[catId] || [])];
      const [removed] = arr.splice(fromIdx, 1);
      arr.splice(toIdx, 0, removed);
      return { ...prev, [catId]: arr };
    });
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen w-full">
        <AdminHeader title="Quiz Oluştur" />
        <form
          onSubmit={handleSubmit}
          className="flex flex-col md:flex-row gap-4 md:gap-8 w-full max-w-7xl px-2 sm:px-4 md:px-8 mx-auto pt-4 md:pt-8 pb-24"
        >
          {/* Sol Panel: Kategoriler ve sorular */}
          <aside
            className={`bg-white rounded-2xl shadow-xl p-3 sm:p-4 md:p-6 flex flex-col w-full md:w-96 min-h-[300px] md:min-h-[600px] mb-4 md:mb-0`}
          >
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <FiSearch className="text-gray-400" />
                <input
                  type="text"
                  placeholder="Kategori ara..."
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-blue-400 outline-none bg-gray-50 text-sm"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto pr-1">
              {categoriesLoading ? (
                <Loader className="h-40" />
              ) : (
                filteredCategories.map((cat) => {
                  const isOpen = openCategory === cat.id;
                  return (
                    <motion.div key={cat.id} layout className="mb-2">
                      <div
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer select-none transition-all ${
                          isOpen
                            ? "bg-blue-50 border border-blue-400"
                            : "hover:bg-gray-100 border border-transparent"
                        }`}
                        onClick={() => setOpenCategory(isOpen ? null : cat.id)}
                      >
                        <span className="font-semibold text-base text-gray-800 flex-1">
                          {cat.kategori_adi}
                        </span>
                        <span className="ml-auto text-gray-400">
                          {isOpen ? <FiChevronDown /> : <FiChevronRight />}
                        </span>
                      </div>
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <CategoryQuestions
                            categoryId={cat.id}
                            selectedQuestions={
                              selectedQuestionsByCategory[cat.id] || []
                            }
                            onSelect={(q) => handleSelectQuestion(cat.id, q)}
                            search={questionSearch}
                            setSearch={setQuestionSearch}
                          />
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })
              )}
            </div>
          </aside>
          {/* Sağ Panel: Drag-drop ile sıralanabilir kategoriler ve sorular */}
          {/* Burada yeni react-dnd tabanlı Container/Card yapısı eklenecek */}
          <main className="flex-1 min-w-0">
            <div className="bg-white rounded-2xl shadow-xl p-3 sm:p-4 md:p-8 min-h-[300px] md:min-h-[600px] flex flex-col">
              <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4 mb-6">
                <div className="flex-1 w-full">
                  <FormField
                    label="Quiz Adı"
                    value={quizName}
                    onChange={(e) => setQuizName(e.target.value)}
                    required
                    placeholder="Quiz adını giriniz"
                    className="text-base md:text-lg"
                  />
                  <div className="flex gap-6 mt-2">
                    <CustomCheckbox
                      type="radio"
                      name="questionOrderType"
                      checked={questionOrderType === "random"}
                      onChange={() => setQuestionOrderType("random")}
                      label="Sorular rastgele gösterilsin"
                    />
                    <CustomCheckbox
                      type="radio"
                      name="questionOrderType"
                      checked={questionOrderType === "ordered"}
                      onChange={() => setQuestionOrderType("ordered")}
                      label="Sorular sıradan gösterilsin"
                    />
                  </div>
                  <div className="flex gap-6 mt-2">
                    <CustomCheckbox
                      type="radio"
                      name="categoryOrderType"
                      checked={categoryOrderType === "random"}
                      onChange={() => setCategoryOrderType("random")}
                      label="Kategoriler rastgele gösterilsin"
                    />
                    <CustomCheckbox
                      type="radio"
                      name="categoryOrderType"
                      checked={categoryOrderType === "ordered"}
                      onChange={() => setCategoryOrderType("ordered")}
                      label="Kategoriler sıradan gösterilsin"
                    />
                  </div>
                </div>
              </div>
              {/* Drag-drop ile kategoriler ve sorular */}
              <div className="h-[500px] overflow-y-auto pr-2">
                {selectedCategoryOrder.length === 0 ? (
                  <div className="border-2 border-dotted border-blue-200 rounded-xl p-8 text-center text-gray-400 my-8">
                    Sol menüden kategori ve soru ekleyin.
                  </div>
                ) : (
                  selectedCategoryOrder.map((catId, catIdx) => {
                    const qObjs = selectedQuestionsByCategory[catId] || [];
                    const cat = categories.find((c) => c.id === catId);
                    return (
                      <CategoryDndContainer
                        key={catId}
                        id={catId}
                        index={catIdx}
                        title={cat?.kategori_adi}
                        questions={qObjs}
                        moveCategory={moveCategory}
                        moveQuestion={moveQuestion}
                      />
                    );
                  })
                )}
              </div>
              {/* Sticky Kaydet Butonu */}
              <div className="fixed bottom-0 left-0 w-full flex flex-col items-center md:items-end pr-0 md:pr-16 pb-4 md:pb-8 pointer-events-none z-50">
                <button
                  type="submit"
                  className={`pointer-events-auto w-full max-w-xs md:max-w-none md:w-auto px-6 md:px-8 py-3 rounded-full text-base md:text-lg font-bold shadow-xl transition-all duration-200 ${
                    saving
                      ? "bg-gray-400 text-white"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                  disabled={saving}
                >
                  {saving ? "Kaydediliyor..." : "Quiz'i Kaydet"}
                </button>
              </div>
            </div>
          </main>
        </form>
      </div>
    </DndProvider>
  );
};

export default CreateNewQuiz;
