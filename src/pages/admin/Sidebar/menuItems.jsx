import { CiBoxList } from "react-icons/ci";
import { FiBarChart2, FiHome, FiSettings, FiUsers } from "react-icons/fi";
import { IoIosAddCircleOutline } from "react-icons/io";
import { IoSchoolSharp } from "react-icons/io5";
import { MdOutlinePeopleAlt, MdOutlinePersonAdd } from "react-icons/md";
import { TbReportAnalytics } from "react-icons/tb";
import { GiTwoCoins } from "react-icons/gi";

export const menuItems = [
  {
    name: "Panel",
    to: "/admin",
    icon: <FiHome size={20} />,
  },
  {
    name: "Okullar",
    icon: <IoSchoolSharp size={20} />,
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
    icon: <GiTwoCoins size={20} />,
    submenu: [
      {
        name: "Kredi Ekle",
        to: "/admin/credits/add",
        icon: <GiTwoCoins size={18} />,
      },
      {
        name: "Kredi Geçmişi",
        to: "/admin/credits",
        icon: <GiTwoCoins size={18} />,
      },
    ],
  },
  {
    name: "Ayarlar",
    to: "/admin/settings",
    icon: <FiSettings size={20} />,
  },
];
