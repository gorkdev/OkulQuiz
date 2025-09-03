import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import FormTemplate from "../FormTemplate/FormTemplate";
import FormField from "../FormTemplate/FormField";
import CustomDropdown from "../FormTemplate/CustomDropdown";
import CustomRadio from "../FormTemplate/CustomRadio";
import CustomCheckbox from "../FormTemplate/CustomCheckbox";
import { createQuestion } from "../../services/mysql/questionService";
import { toast } from "react-toastify";
// Benzersiz id üretici
const generateOptionId = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2);

const difficultyOptions = [
  { value: "easy", label: "Kolay" },
  { value: "medium", label: "Orta" },
  { value: "hard", label: "Zor" },
];

const QuestionFormTemplate = ({ selectedCategory }) => {
  // Başlangıç state'lerini kolayca sıfırlamak için bir fonksiyon
  const initialState = {
    hasQuestionText: true,
    hasQuestionImage: false,
    hasQuestionAudio: false,
    questionAudio: null,
    imageCount: 1,
    images: [{ file: null }],
    optionCount: 2,
    options: [
      { id: generateOptionId(), text: "", image: null, audio: null },
      { id: generateOptionId(), text: "", image: null, audio: null },
    ],
    correctAnswerCount: 1,
    correctAnswers: [0],
    difficulty: "easy",
    duration: 30,
    score: 10,
    hasDuration: true,
    hasScore: true,
    isQuestionRequired: true,
    hasFeedback: false,
    feedback: "",
    hasHint: false,
    hint: "",
    isOrderableOptions: false,
    ageCategory: "tum-yaslar",
    shuffleOptions: false,
  };
  // State'leri tek tek tanımla
  const [hasQuestionText, setHasQuestionText] = useState(
    initialState.hasQuestionText
  );
  const [hasQuestionImage, setHasQuestionImage] = useState(
    initialState.hasQuestionImage
  );
  const [hasQuestionAudio, setHasQuestionAudio] = useState(
    initialState.hasQuestionAudio
  );
  const [questionAudio, setQuestionAudio] = useState(
    initialState.questionAudio
  );
  // hasImages kaldırıldı
  const [imageCount, setImageCount] = useState(initialState.imageCount);
  const [images, setImages] = useState(initialState.images);
  const [optionCount, setOptionCount] = useState(initialState.optionCount);
  const [options, setOptions] = useState(initialState.options);
  const [correctAnswerCount, setCorrectAnswerCount] = useState(
    initialState.correctAnswerCount
  );
  const [correctAnswers, setCorrectAnswers] = useState(
    initialState.correctAnswers
  );
  const [difficulty, setDifficulty] = useState(initialState.difficulty);
  const [duration, setDuration] = useState(initialState.duration);
  const [score, setScore] = useState(initialState.score);
  const [hasDuration, setHasDuration] = useState(initialState.hasDuration);
  const [hasScore, setHasScore] = useState(initialState.hasScore);
  const [isQuestionRequired, setIsQuestionRequired] = useState(
    initialState.isQuestionRequired
  );
  const [hasFeedback, setHasFeedback] = useState(initialState.hasFeedback);
  const [feedback, setFeedback] = useState(initialState.feedback);
  const [hasHint, setHasHint] = useState(initialState.hasHint);
  const [hint, setHint] = useState(initialState.hint);
  const [isOrderableOptions, setIsOrderableOptions] = useState(
    initialState.isOrderableOptions
  );
  const [ageCategory, setAgeCategory] = useState(initialState.ageCategory);
  const [shuffleOptions, setShuffleOptions] = useState(
    initialState.shuffleOptions
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  // Soru metni için state
  const [questionText, setQuestionText] = useState("");

  // Yaş seçenekleri (Tüm Yaşlar + 1-70)
  const ageOptions = [
    { value: "tum-yaslar", label: "Tüm Yaşlar" },
    ...Array.from({ length: 70 }, (_, i) => ({
      value: i + 1,
      label: `${i + 1}`,
    })),
  ];

  // Slider item ekleme/silme
  const handleAddSliderItem = () => {
    setSliderItems((prev) => [...prev, { image: null, text: "" }]);
  };
  const handleRemoveSliderItem = (idx) => {
    setSliderItems((prev) =>
      prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev
    );
  };

  // Dynamic image fields
  const handleImageCountChange = (val) => {
    const count = Math.max(1, Number(val));
    setImageCount(count);
    setImages((prev) => {
      const arr = [...prev];
      while (arr.length < count) arr.push({ file: null });
      return arr.slice(0, count);
    });
  };

  // Dynamic option fields
  const handleOptionCountChange = (val) => {
    const count = Math.max(2, Number(val));
    setOptionCount(count);
    setOptions((prev) => {
      const arr = [...prev];
      while (arr.length < count)
        arr.push({
          id: generateOptionId(),
          text: "",
          image: null,
          audio: null,
        });
      // Eksik audio alanı olanlar için tamamla
      for (let i = 0; i < arr.length; i++) {
        if (arr[i].audio === undefined) arr[i].audio = null;
        if (!arr[i].id) arr[i].id = generateOptionId();
      }
      return arr.slice(0, count);
    });
    setCorrectAnswers((prev) => prev.filter((i) => i < count));
  };

  // Dynamic correct answer count
  const handleCorrectAnswerCountChange = (val) => {
    const count = Math.max(1, Math.min(optionCount, Number(val)));
    setCorrectAnswerCount(count);
    setCorrectAnswers((prev) => prev.slice(0, count));
  };

  // Handle correct answer selection
  const handleCorrectAnswerToggle = (idx) => {
    if (correctAnswerCount === 1) {
      setCorrectAnswers([idx]);
    } else {
      setCorrectAnswers((prev) => {
        if (prev.includes(idx)) {
          return prev.filter((i) => i !== idx);
        } else if (prev.length < correctAnswerCount) {
          return [...prev, idx];
        } else {
          return prev;
        }
      });
    }
  };

  // Şık sıralama fonksiyonları
  const moveOption = (fromIdx, toIdx) => {
    setOptions((prev) => {
      const arr = [...prev];
      const [removed] = arr.splice(fromIdx, 1);
      arr.splice(toIdx, 0, removed);
      return arr;
    });
  };
  // Drag and drop handler
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const fromIdx = result.source.index;
    const toIdx = result.destination.index;
    if (fromIdx === toIdx) return;
    moveOption(fromIdx, toIdx);
  };

  function resetForm() {
    setHasQuestionText(initialState.hasQuestionText);
    setHasQuestionImage(initialState.hasQuestionImage);
    setHasQuestionAudio(initialState.hasQuestionAudio);
    setQuestionAudio(initialState.questionAudio);
    // hasImages kaldırıldı
    setImageCount(initialState.imageCount);
    setImages(initialState.images);
    setOptionCount(initialState.optionCount);
    setOptions([
      { id: generateOptionId(), text: "", image: null, audio: null },
      { id: generateOptionId(), text: "", image: null, audio: null },
    ]);
    setCorrectAnswerCount(initialState.correctAnswerCount);
    setCorrectAnswers(initialState.correctAnswers);
    setDifficulty(initialState.difficulty);
    setDuration(initialState.duration);
    setScore(initialState.score);
    setHasDuration(initialState.hasDuration);
    setHasScore(initialState.hasScore);
    setIsQuestionRequired(initialState.isQuestionRequired);
    setHasFeedback(initialState.hasFeedback);
    setFeedback(initialState.feedback);
    setHasHint(initialState.hasHint);
    setHint(initialState.hint);
    setIsOrderableOptions(initialState.isOrderableOptions);
    setAgeCategory(initialState.ageCategory);
    setShuffleOptions(initialState.shuffleOptions);
    setQuestionText("");
  }

  function handleSaveQuestion(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    // Soru metni zorunluluğu kontrolü
    if (hasQuestionText && (!questionText || questionText.trim() === "")) {
      setLoading(false);
      toast.error("Soru metni boş bırakılamaz!");
      return;
    }
    // Her şık için en az bir alan dolu mu kontrolü
    const allOptionsFilled = options.every(
      (opt) => (opt.text && opt.text.trim()) || opt.image || opt.audio
    );
    if (!allOptionsFilled) {
      setLoading(false);
      toast.error(
        "Tüm şıklarda metin, görsel veya ses alanlarından en az biri doldurulmalı!"
      );
      return;
    }
    // Doğru cevap sayısı kontrolü (sıralama modu kapalıysa)
    if (!isOrderableOptions && correctAnswers.length !== correctAnswerCount) {
      setLoading(false);
      toast.error(
        `Lütfen tam olarak ${correctAnswerCount} adet doğru cevap işaretleyin!`
      );
      return;
    }
    // Türkçe alan isimleriyle, Türkçe karakter içermeyen şekilde veri oluştur
    const questionData = {
      soruMetniVar: hasQuestionText,
      soruMetni: hasQuestionText ? questionText : "",
      soruGorseliVar: hasQuestionImage,
      soruSesiVar: hasQuestionAudio,
      soruSesi: questionAudio,
      gorselVar: hasQuestionImage,
      gorselSayisi: hasQuestionImage ? imageCount : 0,
      gorseller: hasQuestionImage ? images : [],
      sikSayisi: optionCount,
      siklar: options,
      dogruCevapSayisi: correctAnswerCount,
      dogruCevaplar: correctAnswers,
      zorluk: difficulty,
      sure: duration,
      puan: score,
      sureVar: hasDuration,
      puanVar: hasScore,
      soruZorunlu: isQuestionRequired,
      geriBildirimVar: hasFeedback,
      geriBildirim: feedback,
      ipucuVar: hasHint,
      ipucu: hint,
      siraliSiklar: isOrderableOptions,
      hedefYas: ageCategory,
      siklariKaristir: shuffleOptions,
      kategori: selectedCategory
        ? {
            id: selectedCategory.id,
            kategoriAdi: selectedCategory.kategoriAdi,
            aciklama: selectedCategory.aciklama || "",
            durum: selectedCategory.durum,
          }
        : null,
    };
    createQuestion(questionData)
      .then((id) => {
        setSuccess(true);
        setLoading(false);
        resetForm();
        toast.success("Soru başarıyla kaydedildi!");
      })
      .catch((err) => {
        setError(err.message || "Bir hata oluştu.");
        setLoading(false);
        toast.error(err.message || "Bir hata oluştu.");
      });
  }

  return (
    <FormTemplate
      title="Soru Bilgileri"
      onSubmit={handleSaveQuestion}
      loading={loading}
      submitText="Kaydet"
      loadingText="Kaydediliyor..."
    >
      <div className="flex flex-col gap-2">
        {/* Dinamik alanlar için checkboxlar */}
        <div className="border border-gray-300 rounded-lg p-4 flex flex-col gap-2 bg-white">
          <span className="font-semibold border-b border-gray-200 pb-1">
            Genel Seçenekler
          </span>
          <div className="mb-2">
            <CustomDropdown
              label="Soru Hedef Yaş"
              value={ageCategory}
              onChange={(e) => setAgeCategory(Number(e.target.value))}
              options={ageOptions}
              required
            />
          </div>
          <div className="flex flex-wrap gap-4">
            <CustomCheckbox
              checked={hasQuestionText}
              onChange={() => setHasQuestionText((v) => !v)}
              label="Soru metni olsun"
              name="hasQuestionText"
            />
            <CustomCheckbox
              checked={hasQuestionImage}
              onChange={() => setHasQuestionImage((v) => !v)}
              label="Soru görseli olsun"
              name="hasQuestionImage"
            />
            <CustomCheckbox
              checked={hasQuestionAudio}
              onChange={() => setHasQuestionAudio((v) => !v)}
              label="Soru sesi olsun"
              name="hasQuestionAudio"
            />
            <CustomCheckbox
              checked={isQuestionRequired}
              onChange={() => setIsQuestionRequired((v) => !v)}
              label="Soru boş bırakılamaz"
              name="isQuestionRequired"
            />
            <CustomCheckbox
              checked={hasFeedback}
              onChange={() => setHasFeedback((v) => !v)}
              label="Geri bildirim açıklaması olsun"
              name="hasFeedback"
            />
            <CustomCheckbox
              checked={hasHint}
              onChange={() => setHasHint((v) => !v)}
              label="İpucu olsun"
              name="hasHint"
            />
            <CustomCheckbox
              checked={shuffleOptions}
              onChange={() => setShuffleOptions((v) => !v)}
              label="Şıkları karıştırarak göster"
              name="shuffleOptions"
            />
            <CustomCheckbox
              checked={isOrderableOptions}
              onChange={() => setIsOrderableOptions((v) => !v)}
              label="Şıklar sıralansın"
              name="isOrderableOptions"
            />
          </div>
        </div>

        {/* Slider alanı */}
        {/* {hasSlider && (
          <div className="border border-gray-300 rounded-lg p-4 flex flex-col gap-2 bg-white">
            <span className="font-semibold border-b border-gray-200 pb-1">
              Slider İçeriği
            </span>
            {sliderItems.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-4 border border-gray-200 rounded p-3"
              >
                <div className="flex-1 flex flex-col gap-2">
                  <FormField
                    label={`Slider Görseli #${idx + 1}`}
                    name={`slider_image_${idx}`}
                    type="file"
                    required
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      setSliderItems((prev) => {
                        const arr = [...prev];
                        arr[idx].image = file;
                        return arr;
                      });
                    }}
                  />
                  <FormField
                    label="Slider Metni (Opsiyonel)"
                    name={`slider_text_${idx}`}
                    value={item.text}
                    onChange={(e) => {
                      setSliderItems((prev) => {
                        const arr = [...prev];
                        arr[idx].text = e.target.value;
                        return arr;
                      });
                    }}
                    placeholder="Slider için açıklama/metin"
                  />
                </div>
                <button
                  type="button"
                  className="text-red-500 cursor-pointer border border-red-300 rounded px-2 py-1 ml-2 hover:bg-red-100"
                  onClick={() => handleRemoveSliderItem(idx)}
                  disabled={sliderItems.length === 1}
                  title={
                    sliderItems.length === 1
                      ? "En az bir slider içeriği olmalı"
                      : "Bu slider içeriğini sil"
                  }
                >
                  Sil
                </button>
              </div>
            ))}
            <button
              type="button"
              className="text-blue-600 cursor-pointer border border-blue-400 rounded px-3 py-1 mt-2 hover:bg-blue-100 w-fit"
              onClick={handleAddSliderItem}
            >
              + Slider Ekle
            </button>
          </div>
        )} */}

        {/* Soru metni alanı grubu */}
        {hasQuestionText && (
          <div className="border border-gray-300 rounded-lg p-4 flex flex-col gap-2">
            <span className="font-semibold border-b border-gray-200 pb-1">
              Soru Metni
            </span>
            <FormField
              label="Soru Metni"
              name="questionText"
              required={isQuestionRequired}
              placeholder="Soruyu yazın..."
              type="textarea"
              rows={3}
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
            />
          </div>
        )}

        {/* Görsel alanları grubu */}
        {hasQuestionImage && (
          <div className="border border-gray-300 rounded-lg p-4 flex flex-col gap-2">
            <span className="font-semibold border-b border-gray-200 pb-1">
              Görseller
            </span>
            <FormField
              label="Görsel Sayısı"
              name="imageCount"
              type="number"
              value={imageCount}
              onChange={(e) => handleImageCountChange(e.target.value)}
              min={1}
            />
            {images.map((img, idx) => (
              <FormField
                key={idx}
                label={`Görsel #${idx + 1}`}
                name={`image_${idx}`}
                type="file"
                required
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  setImages((prev) => {
                    const arr = [...prev];
                    arr[idx].file = file;
                    return arr;
                  });
                }}
              />
            ))}
          </div>
        )}

        {/* Soru sesi alanı */}
        {hasQuestionAudio && (
          <div className="border border-gray-300 rounded-lg p-4 flex flex-col gap-2">
            <span className="font-semibold border-b border-gray-200 pb-1">
              Soru Sesi
            </span>
            <FormField
              label="Soru Sesi (*.mp3)"
              name="questionAudio"
              type="file"
              accept="audio/mp3,audio/mpeg"
              required
              onChange={(e) => setQuestionAudio(e.target.files[0])}
            />
          </div>
        )}

        {/* Geri bildirim açıklaması alanı */}
        {hasFeedback && (
          <div className="border border-gray-300 rounded-lg p-4 flex flex-col gap-2">
            <span className="font-semibold border-b border-gray-200 pb-1">
              Geri Bildirim Açıklaması
            </span>
            <FormField
              name="feedback"
              type="textarea"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Doğru/yanlış cevap sonrası gösterilecek açıklama"
              rows={2}
            />
          </div>
        )}

        {/* İpucu alanı */}
        {hasHint && (
          <div className="border border-gray-300 rounded-lg p-4 flex flex-col gap-2">
            <span className="font-semibold border-b border-gray-200 pb-1">
              İpucu
            </span>
            <FormField
              name="hint"
              type="textarea"
              value={hint}
              onChange={(e) => setHint(e.target.value)}
              placeholder="Kullanıcıya gösterilecek ipucu"
              rows={2}
            />
          </div>
        )}

        {/* Zorluk, süre ve puan grubu */}
        <div className="border border-gray-300 rounded-lg p-4 flex flex-col gap-2">
          <span className="font-semibold border-b border-gray-200 pb-1">
            Soru Ayarları
          </span>
          <CustomDropdown
            label="Zorluk Seviyesi"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            options={difficultyOptions}
            required
          />
          <div className="flex items-center gap-8">
            <CustomCheckbox
              checked={hasDuration}
              onChange={() => setHasDuration((v) => !v)}
              label="Süre olsun"
              name="hasDuration"
            />
            <CustomCheckbox
              checked={hasScore}
              onChange={() => setHasScore((v) => !v)}
              label="Puan olsun"
              name="hasScore"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {hasDuration && (
              <FormField
                label="Süre (sn)"
                name="duration"
                type="number"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                min={5}
              />
            )}
            {hasScore && (
              <FormField
                label="Puan"
                name="score"
                type="number"
                value={score}
                onChange={(e) => setScore(Number(e.target.value))}
                min={1}
              />
            )}
          </div>
        </div>

        {/* Şıklar grubu */}
        <div className="border border-gray-300 rounded-lg p-4 flex flex-col gap-2">
          <span className="font-semibold border-b border-gray-200 pb-1">
            Şıklar
          </span>
          {isOrderableOptions && (
            <div className="mb-2 text-blue-700 text-sm font-medium">
              Bu soru için kullanıcıdan şıkları doğru sıraya dizmesi istenecek.
              Doğru sıralamayı aşağıdan belirleyin.
            </div>
          )}
          <FormField
            label="Şık Sayısı"
            name="optionCount"
            type="number"
            value={optionCount}
            onChange={(e) => handleOptionCountChange(e.target.value)}
            min={2}
          />
          {isOrderableOptions ? (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="options-droppable">
                {(provided) => (
                  <div
                    className="flex flex-col gap-3"
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    {options.map((opt, idx) => (
                      <Draggable key={opt.id} draggableId={opt.id} index={idx}>
                        {(dragProvided, dragSnapshot) => (
                          <div
                            className={`flex items-center gap-4 border border-gray-200 rounded p-3 bg-white dnd-animate ${
                              dragSnapshot.isDragging
                                ? "shadow-lg scale-105 z-10"
                                : ""
                            }`}
                            ref={dragProvided.innerRef}
                            {...dragProvided.draggableProps}
                          >
                            <div
                              {...dragProvided.dragHandleProps}
                              className="cursor-grab pr-2 flex items-center"
                            >
                              <svg
                                width="18"
                                height="18"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle cx="5" cy="7" r="1.5" fill="#888" />
                                <circle cx="5" cy="12" r="1.5" fill="#888" />
                                <circle cx="5" cy="17" r="1.5" fill="#888" />
                                <circle cx="12" cy="7" r="1.5" fill="#888" />
                                <circle cx="12" cy="12" r="1.5" fill="#888" />
                                <circle cx="12" cy="17" r="1.5" fill="#888" />
                              </svg>
                            </div>
                            <div className="flex-1 flex flex-col gap-2">
                              <FormField
                                label={`Şık #${idx + 1}`}
                                name={`option_text_${idx}`}
                                value={opt.text}
                                onChange={(e) => {
                                  setOptions((prev) => {
                                    const arr = [...prev];
                                    arr[idx].text = e.target.value;
                                    return arr;
                                  });
                                }}
                                placeholder="Şık metni (opsiyonel)"
                                required={false}
                              />
                              <div className="flex gap-4 items-end">
                                <div className="flex-1">
                                  <FormField
                                    label="Görsel (Opsiyonel)"
                                    name={`option_image_${idx}`}
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                      const file = e.target.files[0];
                                      setOptions((prev) => {
                                        const arr = [...prev];
                                        arr[idx].image = file;
                                        return arr;
                                      });
                                    }}
                                  />
                                </div>
                                <div className="flex-1">
                                  <FormField
                                    label="Ses (Opsiyonel)"
                                    name={`option_audio_${idx}`}
                                    type="file"
                                    accept="audio/mp3,audio/mpeg"
                                    onChange={(e) => {
                                      const file = e.target.files[0];
                                      setOptions((prev) => {
                                        const arr = [...prev];
                                        arr[idx].audio = file;
                                        return arr;
                                      });
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          ) : (
            <div className="flex flex-col gap-3">
              {options.map((opt, idx) => (
                <div
                  key={opt.id}
                  className="flex items-center gap-4 border border-gray-200 rounded p-3"
                >
                  <div className="flex-1 flex flex-col gap-2">
                    <FormField
                      label={`Şık #${idx + 1}`}
                      name={`option_text_${idx}`}
                      value={opt.text}
                      onChange={(e) => {
                        setOptions((prev) => {
                          const arr = [...prev];
                          arr[idx].text = e.target.value;
                          return arr;
                        });
                      }}
                      placeholder="Şık metni"
                    />
                    <div className="flex gap-4 items-end">
                      <div className="flex-1">
                        <FormField
                          label="Görsel (Opsiyonel)"
                          name={`option_image_${idx}`}
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            setOptions((prev) => {
                              const arr = [...prev];
                              arr[idx].image = file;
                              return arr;
                            });
                          }}
                        />
                      </div>
                      <div className="flex-1">
                        <FormField
                          label="Ses (Opsiyonel)"
                          name={`option_audio_${idx}`}
                          type="file"
                          accept="audio/mp3,audio/mpeg"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            setOptions((prev) => {
                              const arr = [...prev];
                              arr[idx].audio = file;
                              return arr;
                            });
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center h-full ml-4">
                    {correctAnswerCount === 1 ? (
                      <CustomRadio
                        checked={correctAnswers.includes(idx)}
                        onChange={() => handleCorrectAnswerToggle(idx)}
                        label="Doğru"
                        name="correctAnswers"
                        value={idx}
                      />
                    ) : (
                      <CustomCheckbox
                        checked={correctAnswers.includes(idx)}
                        onChange={() => handleCorrectAnswerToggle(idx)}
                        label="Doğru"
                        name="correctAnswers"
                        value={idx}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          {/* Sıralama modunda doğru cevap sayısı inputunu gizle */}
          {!isOrderableOptions && (
            <FormField
              label="Doğru Cevap Sayısı"
              name="correctAnswerCount"
              type="number"
              value={correctAnswerCount}
              onChange={(e) => handleCorrectAnswerCountChange(e.target.value)}
              min={1}
              max={optionCount}
            />
          )}
        </div>
      </div>
      {error && <div className="text-red-600 text-center mt-2">{error}</div>}
    </FormTemplate>
  );
};

export default QuestionFormTemplate;
