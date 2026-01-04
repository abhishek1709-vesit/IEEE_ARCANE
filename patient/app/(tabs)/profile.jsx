import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Switch,
  FlatList,
  Share,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { removeToken, getCurrentUser } from "../../services/authService";
import { getPatientBills, markBillAsPaid } from "../../services/billService";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  User,
  LogOut,
  Settings,
  ShieldCheck,
  Moon,
  Sun,
  ChevronRight,
  CircleUserRound,
  Mail,
  CalendarDays,
  Clock,
  Shield,
  Bell,
  Receipt,
  CreditCard,
  FileText,
  IndianRupee,
  Download,
} from "lucide-react-native";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { captureRef } from "react-native-view-shot";
import { ref } from "react";
import * as Print from "expo-print";

const { width } = Dimensions.get("window");

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const bottomPadding = insets.bottom > 0 ? insets.bottom : 24;
  const [userData, setUserData] = useState(null);
  const [bills, setBills] = useState([]);
  const [billsLoading, setBillsLoading] = useState(true);
  const [billsError, setBillsError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleLogout = async () => {
    await removeToken();
    router.replace("/login");
  };

  // Calculate days since account creation
  const calculateDaysActive = (createdAt) => {
    if (!createdAt) return 0;
    const createdDate = new Date(createdAt);
    const today = new Date();
    const timeDiff = today - createdDate;
    const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    return daysDiff;
  };

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getCurrentUser();

      if (result.success) {
        setUserData(result.user);
      } else {
        setError(result.error || "Failed to fetch user data");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setError("Failed to fetch user data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const menuItems = [
    {
      icon: <Settings size={22} color="#64748b" />,
      label: "Settings",
      color: "bg-slate-100",
    },
    {
      icon: <ShieldCheck size={22} color="#64748b" />,
      label: "Privacy & Security",
      color: "bg-slate-100",
    },
  ];

  const fetchBills = async () => {
    try {
      setBillsLoading(true);
      setBillsError(null);
      const result = await getPatientBills();

      if (result.success) {
        setBills(result.bills);
      } else {
        setBillsError(result.error || "Failed to fetch bills");
      }
    } catch (error) {
      console.error("Error fetching bills:", error);
      setBillsError("Failed to fetch bills");
    } finally {
      setBillsLoading(false);
    }
  };

  const handleDownloadBill = async (bill) => {
    try {
      // 1. Create your HTML content (Keep your existing billContent variable here)
      const billContent = `
      <html>
        <head>
          <style>
            body { font-family: 'Helvetica', sans-serif; padding: 40px; color: #333; }
            .header { background-color: #2563eb; color: white; padding: 30px; border-radius: 8px 8px 0 0; }
            .content { border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px; padding: 30px; }
            .bill-id { font-size: 20px; font-weight: bold; }
            .status { padding: 5px 12px; border-radius: 20px; font-size: 14px; text-transform: uppercase; }
            .status-paid { background-color: #d1fae5; color: #065f46; }
            .status-unpaid { background-color: #fef3c7; color: #92400e; }
            .amount { font-size: 28px; font-weight: bold; color: #2563eb; }
            .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 style="margin:0">MEDICAL INVOICE</h1>
            <p style="margin:5px 0 0 0 opacity: 0.9">Healthcare Management System</p>
          </div>
          <div class="content">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
              <div class="bill-id">Bill #${bill._id
                ?.slice(-6)
                .toUpperCase()}</div>
              <div class="status ${
                bill.status === "PAID" ? "status-paid" : "status-unpaid"
              }">${bill.status}</div>
            </div>

            <div style="margin-bottom: 20px;">
              <p><strong>Description:</strong><br/>${bill.description}</p>
            </div>

            <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
              <div>
                <strong>Date Issued:</strong><br/>${new Date(
                  bill.createdAt
                ).toLocaleDateString()}
              </div>
              <div style="text-align: right">
                <strong>Total Amount:</strong><br/>
                <span class="amount">₹${
                  bill.amount?.toFixed(2) || "0.00"
                }</span>
              </div>
            </div>

            ${
              bill.doctorId
                ? `
              <div style="margin-top: 20px; padding: 15px; background-color: #f8fafc; border-radius: 8px;">
                <strong>Attending Physician:</strong> Dr. ${
                  bill.doctorId.name || "Unknown Doctor"
                }
              </div>
            `
                : ""
            }

            <div class="footer">
              <p>This is an official digital record. For support, contact your provider.</p>
              <p>&copy; ${new Date().getFullYear()} Healthcare System</p>
            </div>
          </div>
        </body>
      </html>
    `;

      // 2. Generate the PDF
      const { uri } = await Print.printToFileAsync({
        html: billContent,
        base64: false,
      });

      // 3. Share or Save the PDF
      await Sharing.shareAsync(uri, {
        mimeType: "application/pdf",
        dialogTitle: `Medical_Bill_${bill._id?.slice(-6)}`,
        UTI: "com.adobe.pdf",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      Alert.alert("Error", "Could not generate PDF bill.");
    }
  };

  const handlePayBill = async (bill) => {
    try {
      // Call the backend API to mark bill as paid
      const result = await markBillAsPaid(bill._id);

      if (result.success) {
        // Update the local state to reflect the change
        const updatedBills = bills.map(b =>
          b._id === bill._id ? { ...b, status: 'PAID' } : b
        );
        setBills(updatedBills);

        Alert.alert(
          'Payment Successful',
          'Your bill has been marked as paid!',
          [
            { text: 'OK', onPress: () => console.log('Payment confirmed') }
          ]
        );
      } else {
        throw new Error(result.error || 'Failed to process payment');
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      Alert.alert(
        'Payment Error',
        'Failed to process payment. Please try again.',
        [
          { text: 'OK', onPress: () => console.log('Payment error acknowledged') }
        ]
      );
    }
  };

  useEffect(() => {
    fetchUserData();
    fetchBills();
  }, []);

  return (
    <View className="flex-1 bg-slate-50">
      {/* HEADER: Matches Home/Medication tabs */}
      <View
        style={{ paddingTop: insets.top + 20 }}
        className="px-8 pb-8 bg-blue-600 rounded-b-[40px] shadow-lg shadow-blue-200"
      >
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-3xl font-bold text-white tracking-tight">
              Profile
            </Text>
            <Text className="text-blue-100 text-sm mt-1 font-medium">
              Manage your account
            </Text>
          </View>
          <View className="bg-white/20 p-3 rounded-2xl">
            <User size={28} color="#ffffff" />
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 60,
          paddingBottom: bottomPadding + 40,
        }}
      >
        {/* PROFILE CARD - Now shows real user data from backend */}
        <View
          style={{
            elevation: 8,
            shadowColor: "#000",
            shadowOpacity: 0.1,
            shadowRadius: 10,
          }}
          className="bg-white rounded-[32px] p-8 border border-slate-100 -mt-14 mb-8 items-center"
        >
          <View className="bg-blue-50 p-4 rounded-full mb-4">
            <CircleUserRound size={80} color="#3b82f6" strokeWidth={1.5} />
          </View>

          {loading ? (
            <View className="py-8">
              <ActivityIndicator size="large" color="#3b82f6" />
              <Text className="text-slate-500 mt-4">Loading user data...</Text>
            </View>
          ) : error ? (
            <View className="py-4">
              <Text className="text-red-500 text-center mb-2">
                Error loading user data
              </Text>
              <TouchableOpacity
                onPress={fetchUserData}
                className="bg-blue-500 px-4 py-2 rounded-lg"
              >
                <Text className="text-white text-sm">Retry</Text>
              </TouchableOpacity>
            </View>
          ) : userData ? (
            <>
              <Text className="text-2xl font-bold text-slate-900">
                {userData.username}
              </Text>
              {/* <Text className="text-slate-500 font-medium">Patient ID: #{userData._id?.slice(-4).toUpperCase()}</Text> */}

              {/* User Info Details */}
              <View className="w-full mt-6 bg-slate-50 rounded-xl p-4">
                <View className="flex-row items-center mb-3">
                  <Mail size={18} color="#64748b" className="mr-3" />
                  <Text className="text-slate-700 font-medium ml-2">
                    {userData.email}
                  </Text>
                </View>

                <View className="flex-row items-center mb-3">
                  <CalendarDays size={18} color="#64748b" className="mr-3" />
                  <Text className="text-slate-600 text-sm ml-2">
                    Member since:{" "}
                    {new Date(userData.createdAt).toLocaleDateString()}
                  </Text>
                </View>

                <View className="flex-row items-center">
                  <Clock size={18} color="#64748b" className="mr-3" />
                  <Text className="text-slate-600 text-sm ml-2">
                    Account created:{" "}
                    {new Date(userData.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </View>
              </View>

              <View className="flex-row justify-between w-full mt-8 pt-6 border-t border-slate-50">
                <View className="items-center flex-1">
                  <Text className="text-blue-600 text-lg font-bold">
                    {calculateDaysActive(userData.createdAt)}
                  </Text>
                  <Text className="text-slate-400 text-[10px] mt-1 font-bold uppercase tracking-wider">
                    Days Active
                  </Text>
                </View>
              </View>
            </>
          ) : (
            <Text className="text-slate-500">No user data available</Text>
          )}
        </View>

        {/* BILLS AND INVOICES SECTION */}
        <Text className="text-slate-900 text-xl font-bold mb-4 ml-1 mt-8">
          Bills and Invoices
        </Text>

        {/* BILLS AND INVOICES SECTION */}
        <View className="flex-row items-center justify-between mb-4 px-1 mt-8">
          <View className="bg-blue-100 px-3 py-1 rounded-full">
            <Text className="text-blue-700 text-xs font-bold">
              {bills.length} Total
            </Text>
          </View>
        </View>

        {/* Summary Stats Card */}
        {!billsLoading && bills.length > 0 && (
          <View className="flex-row mb-6 gap-3">
            <View className="flex-1 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
              <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">
                Total Unpaid
              </Text>
              <Text className="text-xl font-bold text-slate-900">
                ₹
                {bills
                  .reduce(
                    (acc, b) => (b.status !== "PAID" ? acc + b.amount : acc),
                    0
                  )
                  .toFixed(2)}
              </Text>
            </View>
            <View className="flex-1 bg-blue-600 p-4 rounded-3xl shadow-md shadow-blue-200">
              <Text className="text-blue-100 text-[10px] font-bold uppercase tracking-wider mb-1">
                Last Bill
              </Text>
              <Text className="text-xl font-bold text-white">
                ₹{bills[0]?.amount?.toFixed(2) || "0.00"}
              </Text>
            </View>
          </View>
        )}

        <View className="mb-8">
          {billsLoading ? (
            <View className="py-12 bg-white rounded-[32px] items-center border border-slate-100">
              <ActivityIndicator size="large" color="#3b82f6" />
              <Text className="text-slate-500 mt-4 font-medium">
                Fetching records...
              </Text>
            </View>
          ) : billsError ? (
            <View className="py-8 bg-red-50 rounded-[32px] items-center border border-red-100">
              <Text className="text-red-500 font-bold mb-3">
                Unable to load invoices
              </Text>
              <TouchableOpacity
                onPress={fetchBills}
                className="bg-red-500 px-6 py-2 rounded-full"
              >
                <Text className="text-white font-bold">Retry</Text>
              </TouchableOpacity>
            </View>
          ) : bills.length > 0 ? (
            bills.map((bill, index) => (
              <View
                key={index}
                className="bg-white rounded-[28px] p-5 mb-4 border border-slate-100 shadow-sm"
                style={{ elevation: 2 }}
              >
                <View className="flex-row justify-between items-start mb-4">
                  <View className="flex-row items-center">
                    <View
                      className={`p-3 rounded-2xl ${
                        bill.status === "PAID" ? "bg-green-50" : "bg-amber-50"
                      }`}
                    >
                      <Receipt
                        size={22}
                        color={bill.status === "PAID" ? "#10b981" : "#f59e0b"}
                      />
                    </View>
                    <View className="ml-3">
                      <Text className="text-slate-900 font-bold text-base">
                        Invoice #{bill._id?.slice(-6).toUpperCase()}
                      </Text>
                      <Text className="text-slate-400 text-xs">
                        {new Date(bill.createdAt).toLocaleDateString(
                          undefined,
                          { month: "short", day: "numeric", year: "numeric" }
                        )}
                      </Text>
                    </View>
                  </View>
                  <View
                    className={`px-3 py-1.5 rounded-xl ${
                      bill.status === "PAID" ? "bg-green-100" : "bg-amber-100"
                    }`}
                  >
                    <Text
                      className={`text-[10px] font-black uppercase ${
                        bill.status === "PAID"
                          ? "text-green-700"
                          : "text-amber-700"
                      }`}
                    >
                      {bill.status}
                    </Text>
                  </View>
                </View>

                <Text
                  className="text-slate-600 text-sm leading-5 mb-4"
                  numberOfLines={2}
                >
                  {bill.description ||
                    "General Consultation and Medical Services"}
                </Text>

                <View className="h-[1px] bg-slate-50 w-full mb-4" />

                <View className="flex-row justify-between items-center">
                  <View>
                    <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-tighter">
                      Amount Due
                    </Text>
                    <Text className="text-blue-600 text-2xl font-black">
                      ₹{bill.amount?.toLocaleString("en-IN")}
                    </Text>
                  </View>

                  <View className="flex-row gap-3">
                    {bill.status === "UNPAID" && (
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => handlePayBill(bill)}
                        className="bg-green-500 px-5 py-3 rounded-2xl flex-row items-center"
                      >
                        <CreditCard size={16} color="#ffffff" />
                        <Text className="text-white font-bold text-sm ml-2">
                          Pay Now
                        </Text>
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => handleDownloadBill(bill)}
                      className="bg-slate-900 px-5 py-3 rounded-2xl flex-row items-center"
                    >
                      <Download size={16} color="#ffffff" />
                      <Text className="text-white font-bold text-sm ml-2">
                        PDF
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View className="bg-white rounded-[32px] py-12 items-center border border-dashed border-slate-300">
              <FileText size={48} color="#cbd5e1" />
              <Text className="text-slate-500 font-bold mt-4">
                No Transactions
              </Text>
              <Text className="text-slate-400 text-xs mt-1">
                New bills will appear here automatically.
              </Text>
            </View>
          )}
        </View>

        {/* ACCOUNT SETTINGS SECTION */}
        <Text className="text-slate-900 text-xl font-bold mb-4 ml-1">
          Account Settings
        </Text>

        <View className="bg-white rounded-[32px] p-2 shadow-sm border border-slate-100 mb-8">
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              activeOpacity={0.7}
              className={`flex-row items-center p-4 ${
                index !== menuItems.length - 1 ? "border-b border-slate-50" : ""
              }`}
            >
              <View className={`${item.color} p-2.5 rounded-xl mr-4`}>
                {item.icon}
              </View>
              <Text className="flex-1 text-slate-700 font-bold text-base">
                {item.label}
              </Text>
              <ChevronRight size={20} color="#cbd5e1" />
            </TouchableOpacity>
          ))}

          {/* NOTIFICATIONS - Original menu item */}
          <TouchableOpacity
            activeOpacity={0.7}
            className="flex-row items-center p-4 border-t border-slate-50"
          >
            <View className="bg-slate-100 p-2.5 rounded-xl mr-4">
              <Bell size={22} color="#64748b" />
            </View>
            <Text className="flex-1 text-slate-700 font-bold text-base">
              Notifications
            </Text>
            <ChevronRight size={20} color="#cbd5e1" />
          </TouchableOpacity>
        </View>

        

        {/* LOGOUT BUTTON */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleLogout}
          className="bg-red-50 flex-row items-center justify-center py-5 rounded-[24px] border border-red-100"
        >
          <LogOut size={22} color="#ef4444" className="mr-3" />
          <Text className="text-red-500 font-bold text-lg ml-2">Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
