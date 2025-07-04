import { CiBoxList } from "react-icons/ci";
import {
  FiBarChart2,
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
import { LiaCoinsSolid, LiaSchoolSolid } from "react-icons/lia";
import { PiHandCoinsLight } from "react-icons/pi";

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
        to: "/admin/schools",
        icon: <CiBoxList size={18} />,
      },
      {
        name: "Yeni Okul Ekle",
        to: "/admin/schools/add",
        icon: <IoIosAddCircleOutline size={18} />,
      },
    ],
  },
  {
    name: "Krediler",
    icon: <PiHandCoinsLight size={20} />,
    submenu: [
      {
        name: "Kredi Ekle",
        to: "/admin/credits/add",
        icon: <CiBoxList size={18} />,
      },
      {
        name: "Kredi Geçmişi",
        to: "/admin/credits",
        icon: <MdHistory size={18} />,
      },
    ],
  },
  {
    name: "Log Geçmişi",
    to: "/admin/logs",
    icon: <MdHistory size={20} />,
  },
  {
    name: "Ayarlar",
    to: "/admin/settings",
    icon: <FiSettings size={20} />,
  },
];
