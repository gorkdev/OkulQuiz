import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { getQuizById } from "../../../services/mysql/quizService";
import { getQuestionsByIds } from "../../../services/mysql/questionService";
import { motion } from "framer-motion";
import Confetti from "react-confetti";
import { IoIosWarning } from "react-icons/io";
import { DndProvider, useDrag, useDrop, useDragLayer } from "react-dnd";
import { HTML5Backend, getEmptyImage } from "react-dnd-html5-backend";
import { BsGripVertical } from "react-icons/bs";
import ConfettiPatlat from "../../../components/ConfettiPatlat";

const QuizSolve = () => {
  const { quizId } = useParams();
  const [quizData, setQuizData] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(null);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const audioRef = useRef(null);
  const [confettiPieces, setConfettiPieces] = useState(0);
  const [answersReview, setAnswersReview] = useState([]);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [optionOrder, setOptionOrder] = useState([]);
  const [viewport, setViewport] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const update = () =>
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Klavye ile şık seçimi (erişilebilirlik)
  const handleKeyDownOption = (event, optionIndex) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleOptionSelect(optionIndex);
    }
  };

  // Konfeti animasyonu
  useEffect(() => {
    if (confettiPieces > 0) {
      const timer = setTimeout(() => {
        setConfettiPieces((prev) => Math.max(prev - 10, 0));
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [confettiPieces]);

  // Quiz verilerini yükle
  useEffect(() => {
    async function fetchQuizAndQuestions() {
      setLoading(true);
      try {
        const quizData = await getQuizById(quizId);
        if (!quizData) return;

        let allQuestionIds = [];
        if (quizData.categoryOrder && quizData.questionsByCategory) {
          quizData.categoryOrder.forEach((catId) => {
            const qIds = quizData.questionsByCategory[catId] || [];
            allQuestionIds = allQuestionIds.concat(qIds);
          });
        }

        const questionObjs = await getQuestionsByIds(allQuestionIds);
        setQuizData(quizData);
        setQuestions(questionObjs);
      } catch (error) {
        console.error("Quiz yüklenirken hata:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchQuizAndQuestions();
  }, [quizId]);

  // Soru değiştiğinde yapılacaklar
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setAudioPlaying(false);
    }
    setImageLoaded(false);
    setSelectedOptions([]);

    if (questions.length > 0 && currentQuestionIndex < questions.length) {
      const currentQuestion = questions[currentQuestionIndex];
      if (currentQuestion.sureVar) {
        setTimeLeft(currentQuestion.sure);
        const timer = setInterval(() => {
          setTimeLeft((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              // Süre dolduğunda, eğer seçili şık yoksa boş olarak işaretle
              handleNextQuestion(true);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        return () => clearInterval(timer);
      }
    }
  }, [currentQuestionIndex, questions]);

  // Şıkları karıştır veya sırala
  useEffect(() => {
    if (!questions.length || currentQuestionIndex >= questions.length) return;
    const currentQuestion = questions[currentQuestionIndex];
    let initialOrder = currentQuestion.siklar?.map((_, idx) => idx) || [];
    if (currentQuestion.siklariKaristir) {
      initialOrder = shuffleArray(initialOrder);
    }
    setOptionOrder(initialOrder);
    setSelectedOptions([]); // Sıra değişince seçimi sıfırla
  }, [currentQuestionIndex, questions]);

  // Shuffle fonksiyonu
  function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // DnD: react-dnd ile sıralama
  const moveOption = useCallback(
    (fromIndex, toIndex) => {
      if (fromIndex === toIndex) return;
      setOptionOrder((prev) => {
        const newOrder = [...prev];
        const [removed] = newOrder.splice(fromIndex, 1);
        newOrder.splice(toIndex, 0, removed);
        const currentQuestion = questions[currentQuestionIndex];
        if (currentQuestion?.siraliSiklar) {
          setSelectedOptions(newOrder);
        }
        return newOrder;
      });
    },
    [currentQuestionIndex, questions]
  );

  const playQuestionAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }

    const currentQuestion = questions[currentQuestionIndex];
    if (currentQuestion.soruSesiVar && currentQuestion.soruSesi) {
      audioRef.current = new Audio(currentQuestion.soruSesi);
      audioRef.current
        .play()
        .then(() => {
          setAudioPlaying(true);
          audioRef.current.addEventListener("ended", () =>
            setAudioPlaying(false)
          );
        })
        .catch((error) => console.error("Ses oynatılamadı:", error));
    }
  };

  const handleOptionSelect = (optionIndex) => {
    const currentQuestion = questions[currentQuestionIndex];

    if (currentQuestion.dogruCevapSayisi === 1) {
      setSelectedOptions([optionIndex]);
    } else {
      setSelectedOptions((prev) => {
        if (prev.includes(optionIndex)) {
          return prev.filter((item) => item !== optionIndex);
        } else {
          return [...prev, optionIndex];
        }
      });
    }
  };

  // handleNextQuestion: skipEmpty true ise, seçili şık yoksa boş olarak işaretle
  const handleNextQuestion = (skipEmpty = false) => {
    const currentQuestion = questions[currentQuestionIndex];

    let selectedForReview;
    if (currentQuestion.siraliSiklar) {
      selectedForReview = [...optionOrder];
    } else {
      selectedForReview = [...selectedOptions];
    }
    // Süre dolduğunda ve hiç seçim yoksa, boş olarak işaretle
    if (skipEmpty && selectedForReview.length === 0) {
      selectedForReview = [];
    }

    let isCorrect;
    if (currentQuestion.siraliSiklar) {
      // Kullanıcının sıraladığı şıkların id/text dizisi
      const userOrder = selectedForReview.map((idx) => {
        const sik = currentQuestion.siklar[idx];
        return sik?.id || sik?.text;
      });
      // Doğru sıralama: siklar'ın mevcut sırası (id/text dizisi)
      const correctOrder = currentQuestion.siklar.map(
        (sik) => sik?.id || sik?.text
      );
      isCorrect = JSON.stringify(userOrder) === JSON.stringify(correctOrder);
    } else {
      isCorrect =
        JSON.stringify(selectedForReview.sort()) ===
        JSON.stringify(currentQuestion.dogruCevaplar.sort());
    }

    setAnswersReview((prev) => [
      ...prev,
      {
        questionIndex: currentQuestionIndex,
        selected: selectedForReview,
        correct: currentQuestion.dogruCevaplar,
        isCorrect,
      },
    ]);

    if (isCorrect) {
      setScore(score + (currentQuestion.puanVar ? currentQuestion.puan : 1));
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setConfettiPieces(150);
      setTimeout(() => setConfettiPieces(0), 5000);
      setQuizCompleted(true);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedOptions([]);
    setScore(0);
    setQuizCompleted(false);
    setAnswersReview([]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-3 text-md font-medium text-gray-700">
            Yükleniyor...
          </p>
        </div>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-5 max-w-md bg-white rounded-lg shadow-sm">
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            Quiz Bulunamadı
          </h2>
          <p className="text-gray-600">İstenen quiz yüklenemedi.</p>
        </div>
      </div>
    );
  }

  if (quizCompleted) {
    // Not ve mesaj hesaplama
    let grade = "";
    let message = "";
    let color = "";
    const maxScore = questions.reduce(
      (acc, q) => acc + (q.puanVar ? q.puan : 1),
      0
    );
    const percent = (score / maxScore) * 100;
    if (percent >= 90) {
      grade = "A";
      color = "bg-green-100 text-green-800 border-green-300";
      message =
        "Harika iş çıkardın! Performansın mükemmele çok yakın. Böyle devam et!";
    } else if (percent >= 75) {
      grade = "B";
      color = "bg-blue-100 text-blue-800 border-blue-300";
      message =
        "Çok iyi! Az bir farkla daha da yükselebilirsin. Biraz daha pratik harika olur.";
    } else if (percent >= 50) {
      grade = "C";
      color = "bg-yellow-100 text-yellow-800 border-yellow-300";
      message =
        "Fena değil! Düzenli tekrarlarla çok daha iyi sonuçlar alabilirsin.";
    } else {
      grade = "D";
      color = "bg-red-100 text-red-800 border-red-300";
      message =
        "Moral bozma. Her deneme daha iyiye götürür, tekrar deneyerek güçlenebilirsin.";
    }
    return (
      <div className="min-h-screen py-8 px-4 relative">
        <ConfettiPatlat />
        <div className="max-w-4xl mx-auto">
          <div
            className={`w-full mb-6 rounded-xl border ${color} px-5 py-4 shadow-sm flex items-center justify-between`}
          >
            <div>
              <div className="text-2xl font-extrabold tracking-tight">
                Notun: {grade}
              </div>
              <div className="text-sm font-medium opacity-90 mt-0.5">
                Puanın: {score} / {maxScore} ({percent.toFixed(0)}%)
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-white/70 text-xs font-semibold border">
                Tamamlandı
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="md:col-span-1 max-h-[300px] bg-white rounded-xl shadow-sm border border-gray-100 p-5"
            >
              <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center mb-3">
                <svg
                  className="w-7 h-7"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
              </div>
              <h2 className="text-lg font-bold text-gray-800">Tebrikler!</h2>
              <p className="text-sm text-gray-600 mt-1">{message}</p>
              <div className="mt-4 flex items-center gap-3">
                <div className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold">
                  Puan: {score}
                </div>
                <div className="px-3 py-1.5 bg-gray-50 text-gray-700 rounded-lg text-xs font-semibold">
                  Sorular: {questions.length}
                </div>
              </div>
              <button
                onClick={resetQuiz}
                className="mt-5 w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Tekrar Dene
              </button>
            </motion.div>

            <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h3 className="text-base font-bold text-gray-800 mb-3">
                Cevaplar
              </h3>
              <div className="space-y-3 overflow-auto pr-1">
                {(() => {
                  const shown = new Set();
                  return answersReview
                    .filter((ans) => {
                      if (shown.has(ans.questionIndex)) return false;
                      shown.add(ans.questionIndex);
                      return true;
                    })
                    .map((answer, index) => {
                      const question = questions[answer.questionIndex];
                      return (
                        <div
                          key={index}
                          className={`p-4 rounded-lg border ${
                            answer.isCorrect
                              ? "border-green-200/70 bg-green-50"
                              : "border-red-200/70 bg-red-50"
                          }`}
                        >
                          <div className="flex items-start">
                            <div
                              className={`flex-shrink-0 w-5 h-5 rounded-full mt-0.5 mr-3 ${
                                answer.isCorrect ? "bg-green-500" : "bg-red-500"
                              }`}
                            ></div>
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-gray-800">
                                {question.soruMetni || `Soru ${index + 1}`}
                              </p>
                              <div
                                className={`mt-1.5 flex ${
                                  question.siklar?.some((sik) => sik.image)
                                    ? "flex-row items-center flex-wrap gap-2"
                                    : "flex-col gap-1"
                                }`}
                              >
                                {(() => {
                                  const hasImageSelected = answer.selected.some(
                                    (s) => question.siklar[s]?.image
                                  );
                                  if (hasImageSelected) {
                                    return (
                                      <div className="flex flex-row items-center gap-2">
                                        <span className="font-medium text-xs text-gray-600">
                                          Senin cevabın:
                                        </span>
                                        {answer.selected.map((s, i) => {
                                          const sik = question.siklar[s];
                                          if (!sik) return null;
                                          return (
                                            <span
                                              key={i}
                                              className="inline-flex items-center mr-2 py-0.5 px-1.5 rounded bg-white/70 border"
                                            >
                                              {sik.image && (
                                                <img
                                                  src={sik.image}
                                                  alt={sik.text || "Seçenek"}
                                                  className="w-6 h-6 rounded object-cover inline-block mr-1"
                                                />
                                              )}
                                              <span className="text-xs text-gray-700">
                                                {sik.text}
                                              </span>
                                            </span>
                                          );
                                        })}
                                      </div>
                                    );
                                  }
                                  return (
                                    <p className="text-xs text-gray-600">
                                      <span className="font-medium">
                                        Senin cevabın:
                                      </span>{" "}
                                      {answer.selected
                                        .map((s) => question.siklar[s]?.text)
                                        .join(", ")}
                                    </p>
                                  );
                                })()}

                                {!answer.isCorrect &&
                                  (() => {
                                    if (question.siraliSiklar) {
                                      const hasImageCorrect =
                                        question.siklar &&
                                        question.siklar.some(
                                          (sik) => sik?.image
                                        );
                                      if (hasImageCorrect) {
                                        return (
                                          <div className="flex flex-row items-center gap-2 mt-1">
                                            <span className="font-medium text-xs text-gray-600">
                                              Doğru cevap:
                                            </span>
                                            {question.siklar &&
                                              question.siklar.map((sik, i) => {
                                                if (!sik) return null;
                                                return (
                                                  <span
                                                    key={i}
                                                    className="inline-flex items-center mr-2 py-0.5 px-1.5 rounded bg-white/70 border"
                                                  >
                                                    {sik.image && (
                                                      <img
                                                        src={sik.image}
                                                        alt={
                                                          sik.text || "Seçenek"
                                                        }
                                                        className="w-6 h-6 rounded object-cover inline-block mr-1"
                                                      />
                                                    )}
                                                    <span className="text-xs text-gray-700">
                                                      {sik.text}
                                                    </span>
                                                  </span>
                                                );
                                              })}
                                          </div>
                                        );
                                      }
                                      return (
                                        <p className="text-xs text-gray-600">
                                          <span className="font-medium">
                                            Doğru cevap:
                                          </span>{" "}
                                          {question.siklar &&
                                            question.siklar
                                              .map((sik) => sik?.text)
                                              .filter(Boolean)
                                              .join(", ")}
                                        </p>
                                      );
                                    }
                                    const hasImageCorrect = answer.correct.some(
                                      (c) => question.siklar[c]?.image
                                    );
                                    if (hasImageCorrect) {
                                      return (
                                        <div className="flex flex-row items-center gap-2 mt-1">
                                          <span className="font-medium text-xs text-gray-600">
                                            Doğru cevap:
                                          </span>
                                          {answer.correct.map((c, i) => {
                                            const sik = question.siklar[c];
                                            if (!sik) return null;
                                            return (
                                              <span
                                                key={i}
                                                className="inline-flex items-center mr-2 py-0.5 px-1.5 rounded bg-white/70 border"
                                              >
                                                {sik.image && (
                                                  <img
                                                    src={sik.image}
                                                    alt={sik.text || "Seçenek"}
                                                    className="w-6 h-6 rounded object-cover inline-block mr-1"
                                                  />
                                                )}
                                                <span className="text-xs text-gray-700">
                                                  {sik.text}
                                                </span>
                                              </span>
                                            );
                                          })}
                                        </div>
                                      );
                                    }
                                    return (
                                      <p className="text-xs text-gray-600">
                                        <span className="font-medium">
                                          Doğru cevap:
                                        </span>{" "}
                                        {answer.correct
                                          .map((c) => question.siklar[c]?.text)
                                          .filter(Boolean)
                                          .join(", ")}
                                      </p>
                                    );
                                  })()}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    });
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const hasOptionImages = currentQuestion.siklar?.some((sik) => sik.image);

  // İlgili sorunun bilgilerini console'a yazdır
  console.log("Current Question:", currentQuestion);

  // react-dnd kartı
  const DraggableOption = ({ option, index }) => {
    const ref = useRef(null);
    const [{ handlerId, isOver }, drop] = useDrop({
      accept: "OPTION",
      collect(monitor) {
        return {
          handlerId: monitor.getHandlerId(),
          isOver: monitor.isOver({ shallow: true }),
        };
      },
      hover(item) {
        if (!ref.current) return;
        const dragIndex = item.index;
        const hoverIndex = index;
        if (dragIndex === hoverIndex) return;
        // Move immediately when hovered
        moveOption(dragIndex, hoverIndex);
        item.index = hoverIndex;
      },
    });
    const [{ isDragging }, drag, preview] = useDrag({
      type: "OPTION",
      item: () => {
        const rect = ref.current?.getBoundingClientRect();
        return { index, width: rect ? Math.round(rect.width) : undefined };
      },
      collect: (monitor) => ({ isDragging: monitor.isDragging() }),
    });

    useEffect(() => {
      // Hide default HTML5 preview; we'll render custom preview
      preview(getEmptyImage(), { captureDraggingState: true });
    }, [preview]);

    drag(drop(ref));
    return (
      <div
        ref={ref}
        data-handler-id={handlerId}
        className={`flex items-center gap-4 border rounded-lg p-3 bg-white ${
          isOver ? "border-2 border-dotted border-blue-300" : "border-gray-200"
        } ${isDragging ? "opacity-0" : "opacity-100"}`}
      >
        <BsGripVertical className="text-gray-500 w-5 h-5" />
        {option.image ? (
          <div className="relative aspect-square w-12 h-12">
            <img
              src={option.image}
              alt=""
              loading="lazy"
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover rounded-md"
            />
          </div>
        ) : null}
        <div className="flex items-center justify-between w-full">
          <span className="text-sm font-medium text-gray-800 truncate">
            {option.text}
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-100 text-gray-700 border border-yellow-400">
            {index + 1}
          </span>
        </div>
      </div>
    );
  };

  const CustomDragLayerComp = ({ currentQuestion, optionOrder }) => {
    const { isDragging, item, currentOffset } = useDragLayer((monitor) => ({
      isDragging: monitor.isDragging(),
      item: monitor.getItem(),
      currentOffset: monitor.getSourceClientOffset(),
    }));

    if (!isDragging || !item || item.index == null) return null;
    const optionIdx = optionOrder[item.index];
    const option = currentQuestion.siklar[optionIdx];

    const layerStyles = {
      pointerEvents: "none",
      position: "fixed",
      zIndex: 100,
      left: 0,
      top: 0,
    };

    const getItemStyles = () => {
      if (!currentOffset) return { display: "none" };
      const { x, y } = currentOffset;
      const transform = `translate(${x}px, ${y}px) scale(1.06)`;
      return {
        transform,
        WebkitTransform: transform,
        width: item?.width ? `${item.width}px` : undefined,
      };
    };

    return (
      <div style={layerStyles}>
        <div style={getItemStyles()}>
          <div className="flex items-center gap-3 border border-blue-300 rounded-xl p-3 bg-white shadow-xl">
            <BsGripVertical className="text-blue-500 w-5 h-5" />
            {option?.image ? (
              <div className="relative aspect-square w-12 h-12">
                <img
                  src={option.image}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover rounded-md"
                />
              </div>
            ) : null}
            <span className="text-sm font-semibold text-gray-900 truncate max-w-[220px]">
              {option?.text}
            </span>
          </div>
        </div>
      </div>
    );
  };

  // Seçenekler render
  const renderOptions = () => {
    if (currentQuestion.siraliSiklar) {
      // react-dnd ile sıralama
      return (
        <DndProvider backend={HTML5Backend}>
          <div className="flex flex-col gap-3">
            {optionOrder.map((optionIdx, idx) => {
              const option = currentQuestion.siklar[optionIdx];
              return (
                <DraggableOption
                  key={option.id || optionIdx}
                  option={option}
                  index={idx}
                />
              );
            })}
          </div>
          <CustomDragLayerComp
            currentQuestion={currentQuestion}
            optionOrder={optionOrder}
          />
        </DndProvider>
      );
    } else {
      // Normal veya karışık şıklar
      return (
        <div
          className={
            hasOptionImages
              ? "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3"
              : "space-y-2"
          }
        >
          {optionOrder.map((optionIdx, index) => {
            const option = currentQuestion.siklar[optionIdx];
            if (!option) return null;
            return (
              <motion.div
                layout
                whileTap={{ scale: 0.98 }}
                key={option.id || optionIdx}
                onClick={() => handleOptionSelect(optionIdx)}
                role="button"
                tabIndex={0}
                aria-pressed={selectedOptions.includes(optionIdx)}
                onKeyDown={(e) => handleKeyDownOption(e, optionIdx)}
                className={`rounded-xl overflow-hidden cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  selectedOptions.includes(optionIdx)
                    ? "ring-2 ring-blue-500 border border-blue-200"
                    : "border border-gray-200 hover:border-gray-300"
                }`}
              >
                {option.image ? (
                  <div className="relative aspect-square cursor-pointer bg-gray-50">
                    <img
                      src={option.image}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    {selectedOptions.includes(optionIdx) && (
                      <div className="absolute inset-0 ring-2 ring-blue-500 rounded-xl pointer-events-none"></div>
                    )}
                  </div>
                ) : (
                  <div
                    className={`p-4 transition-colors ${
                      selectedOptions.includes(optionIdx)
                        ? "bg-blue-50"
                        : "bg-white hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center">
                      <div
                        className={`w-4 h-4 rounded-full border mr-2 ${
                          selectedOptions.includes(optionIdx)
                            ? "border-blue-500 bg-blue-500"
                            : "border-gray-400"
                        }`}
                      ></div>
                      <span className="text-sm font-medium text-gray-800">
                        {option.text}
                      </span>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      );
    }
  };

  return (
    <div className="">
      <div className="max-w-2xl bg-white rounded-2xl mx-auto px-4 py-6">
        {/* Üst Bilgi ve İlerleme */}
        <div className="sticky top-0 z-10 -mx-4 mb-4 px-4 pt-3 pb-3 bg-gradient-to-b from-white/90 to-white/60 backdrop-blur">
          <div className="flex items-center justify-between">
            <div className="text-[13px] font-semibold text-blue-700">
              Soru {currentQuestionIndex + 1}/{questions.length}
            </div>
            <div className="flex items-center gap-2 text-xs">
              {currentQuestion.puanVar && (
                <span className="px-2 py-1 rounded-full bg-green-50 text-green-700 border border-green-200">
                  {currentQuestion.puan} Puan
                </span>
              )}
              {currentQuestion.sureVar && (
                <span
                  className="px-2 py-1 rounded-full bg-red-50 text-red-700 border border-red-200"
                  aria-live="polite"
                >
                  {timeLeft}s
                </span>
              )}
              {/* Ses butonu başlıktan kaldırıldı */}
            </div>
          </div>
          <div className="mt-2 w-full h-2 sm:h-2 rounded-full bg-gray-200 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500 ease-out"
              style={{
                width: `${(currentQuestionIndex / questions.length) * 100}%`,
              }}
            ></div>
          </div>
        </div>

        {/* Soru Kartı */}
        <div className="bg-white">
          {/* Soru Görselleri */}
          {currentQuestion.gorselVar &&
            currentQuestion.gorseller?.length > 0 && (
              <div className="mb-4 grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                {currentQuestion.gorseller.map((image, index) => (
                  <div
                    key={index}
                    className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden"
                  >
                    <img
                      src={image}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover"
                      onLoad={() => setImageLoaded(true)}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "https://via.placeholder.com/200?text=Resim+Yok";
                      }}
                    />
                  </div>
                ))}
              </div>
            )}

          {/* Soru Ses */}
          {currentQuestion.soruSesiVar && currentQuestion.soruSesi && (
            <button
              onClick={playQuestionAudio}
              aria-label={
                audioPlaying ? "Soru sesi oynatılıyor" : "Soru sesini dinle"
              }
              className={`mb-3 cursor-pointer inline-flex items-center gap-2 px-5 py-2 rounded-full border text-xs ${
                audioPlaying
                  ? "bg-blue-50 text-blue-700 border-blue-200"
                  : "bg-gray-50 text-gray-700 border-gray-200"
              }`}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414 1.414m2.828-9.9a9 9 0 012.728-2.728"
                ></path>
              </svg>
              {audioPlaying ? "Oynatılıyor" : "Sesi Dinle"}
            </button>
          )}

          {/* Soru Metni */}
          <h2 className="text-lg font-semibold text-gray-900 leading-relaxed mb-3">
            {currentQuestion.soruMetni}
          </h2>

          {/* İpucu */}
          {currentQuestion.ipucuVar && currentQuestion.ipucu && (
            <div className="mb-4 flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
              <IoIosWarning className="w-5 h-5 text-yellow-600 flex-shrink-0" />
              <span className="font-semibold text-yellow-800">İpucu:</span>
              <span className="text-yellow-700">{currentQuestion.ipucu}</span>
            </div>
          )}

          {/* Seçenekler */}
          {renderOptions()}
        </div>

        {/* Alt Navigasyon */}
        <div className="sticky bottom-0 -mx-4 mt-5 px-4 pb-4 pt-3 bg-gradient-to-t from-white/90 to-white/40 backdrop-blur">
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={handleNextQuestion}
              disabled={
                selectedOptions.length === 0 && currentQuestion.soruZorunlu
              }
              className={`min-w-[120px] inline-flex cursor-pointer items-center justify-center px-4 py-2.5 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                selectedOptions.length === 0 && currentQuestion.soruZorunlu
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500"
              }`}
            >
              {currentQuestionIndex === questions.length - 1
                ? "Bitir"
                : "Sonraki"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizSolve;
