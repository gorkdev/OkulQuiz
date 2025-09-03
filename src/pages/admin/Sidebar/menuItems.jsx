import { CiBoxList } from "react-icons/ci";
import {
  FiBarChart2,
  FiBookOpen,
  FiHome,
  FiLogIn,
  FiSettings,
  FiUsers,
} from "react-icons/fi";
import { IoIosAddCircleOutline, IoMdAdd } from "react-icons/io";
import { IoSchoolSharp } from "react-icons/io5";
import {
  MdHistory,
  MdOutlinePeopleAlt,
  MdOutlinePersonAdd,
} from "react-icons/md";
import { TbReportAnalytics } from "react-icons/tb";
import { GiTwoCoins } from "react-icons/gi";
import {
  LiaCoinsSolid,
  LiaListSolid,
  LiaQuestionSolid,
  LiaSchoolSolid,
} from "react-icons/lia";
import {
  PiExam,
  PiHandCoins,
  PiHandCoinsLight,
  PiHandCoinsThin,
} from "react-icons/pi";
import { BiCategory } from "react-icons/bi";

export const menuItems = [
  {
    name: "Panel",
    to: "/admin",
    icon: <FiHome size={20} />,
  },
  {
    name: "Okullar",
    icon: <LiaSchoolSolid size={20} />,
    submenu: [
      {
        name: "Tüm Okullar",
        to: "/admin/okullar",
        icon: <CiBoxList size={18} />,
      },
      {
        name: "Yeni Okul Ekle",
        to: "/admin/okullar/ekle",
        icon: <IoIosAddCircleOutline size={18} />,
      },
    ],
  },
  {
    name: "Krediler",
    icon: <PiHandCoins size={20} />,
    submenu: [
      {
        name: "Kredi Ekle",
        to: "/admin/krediler/ekle",
        icon: <IoIosAddCircleOutline size={18} />,
      },
      {
        name: "Kredi Geçmişi",
        to: "/admin/krediler",
        icon: <MdHistory size={18} />,
      },
    ],
  },
  {
    name: "Quizler",
    icon: <PiExam size={20} />,
    submenu: [
      {
        name: "Tüm Quizler",
        to: "/admin/quizler",
        icon: <CiBoxList size={18} />,
      },
      {
        name: "Yeni Quiz Ekle",
        to: "/admin/quizler/ekle",
        icon: <IoIosAddCircleOutline size={18} />,
      },
    ],
  },
  {
    name: "Kategoriler",
    icon: <BiCategory size={20} />,
    submenu: [
      {
        name: "Tüm Kategoriler",
        to: "/admin/kategoriler",
        icon: <CiBoxList size={18} />,
      },
      {
        name: "Yeni Kategori Ekle",
        to: "/admin/kategoriler/ekle",
        icon: <IoIosAddCircleOutline size={18} />,
      },
    ],
  },
  {
    name: "Sorular",
    icon: <LiaQuestionSolid size={20} />,
    submenu: [
      {
        name: "Tüm Sorular",
        to: "/admin/sorular",
        icon: <CiBoxList size={18} />,
      },
      {
        name: "Yeni Soru Ekle",
        to: "/admin/sorular/ekle",
        icon: <IoIosAddCircleOutline size={18} />,
      },
    ],
  },
  {
    name: "Log Geçmişi",
    to: "/admin/loglar",
    icon: <MdHistory size={20} />,
  },
  {
    name: "Ayarlar",
    to: "/admin/ayarlar",
    icon: <FiSettings size={20} />,
  },
];
