import { View, Text, Platform, Modal, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import CustomAppBar from "../components/CustomAppBar";
import { useNavigation } from "@react-navigation/native";
import { Button, TextInput } from "react-native-paper";
import RNDateTimePicker from "@react-native-community/datetimepicker";
import CustomButton from "../components/CustomButton";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { WebView } from "react-native-webview";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { calcularDiasRestantes } from "../utils/utils";
import instance from "../utils/Instance";
import Loader from "../components/Loader";

export default function ReportScreen() {
  const navigation = useNavigation();

  const [fechaDesde, setFechaDesde] = useState(new Date());
  const [fechaHasta, setFechaHasta] = useState(new Date());
  const [showPicker, setShowPicker] = useState({ visible: false, field: null });
  const [pdfUri, setPdfUri] = useState(null);
  const [showPdfViewer, setShowPdfViewer] = useState(false);
  const [htmlContent, setHtml] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleDateChange = (event, selectedDate) => {
    if (Platform.OS === "android") {
      setShowPicker({ visible: false, field: null });
    }

    if (selectedDate) {
      if (showPicker.field === "desde") {
        setFechaDesde(selectedDate);
      } else if (showPicker.field === "hasta") {
        setFechaHasta(selectedDate);
      }
    }
  };

  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return `${d.getFullYear()}-${(d.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${d.getDate().toString().padStart(2, "0")}`;
  };

  const generarTablaHtml = (data) => {
    const rows = data
      .map(
        (item) => `
      <tr>
        <td>${(item.client_id ?? "").toUpperCase()}</td>
        <td>${item.fecha_instalacion?.split(" ")[0]}</td>
        <td>${item.fecha_pago?.split(" ")[0]}</td>
        <td>${item.meses}</td>
        <td>${item.dias_restantes}</td>
      </tr>
    `
      )
      .join("");

    return `
    <html>
      <head>
        <style>
          table {
            width: 100%;
            border-collapse: collapse;
            font-family: Arial;
          }
          th, td {
            border: 1px solid #ccc;
            padding: 8px;
            text-align: center;
          }
          th {
            background-color: #eee;
          }
        </style>
      </head>
      <body>
        <h2>Licencias que vencen entre ${formatDate(fechaDesde)} y ${formatDate(
      fechaHasta
    )}</h2>
        <table>
          <thead>
            <tr>
              <th>Empresa</th>
              <th>Fecha Instalación</th>
              <th>Fecha Pago</th>
              <th>Meses</th>
              <th>Tiempo Restante</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </body>
    </html>
  `;
  };

  const getInformation = async () => {
    setIsLoading(true);
    const response = await instance.get("licencia-web/list");
    const allData = response.data.data;

    const desde = new Date(fechaDesde.setHours(0, 0, 0, 0));
    const hasta = new Date(fechaHasta.setHours(23, 59, 59, 999));

    const filtrados = allData
      .map((item) => {
        const { dias, fechaExpira } = calcularDiasRestantes(
          item.fecha_pago,
          item.meses
        );
        return {
          ...item,
          dias_restantes: dias,
          fecha_expira: fechaExpira,
        };
      })
      .filter((item) => {
        if (item.meses === "999" || !item.fecha_expira) return false;

        return item.fecha_expira >= desde && item.fecha_expira <= hasta;
      });

    const html = generarTablaHtml(filtrados);
    const { uri } = await Print.printToFileAsync({ html: html });
    setPdfUri(uri);
    setHtml(filtrados.length > 0 ? html : "");
    setShowPdfViewer(true);
    setIsLoading(false);
  };

  const sharePDF = async () => {
    await Sharing.shareAsync(pdfUri);
  };

  return (
    <View style={{ flex: 1 }}>
      <Loader loading={isLoading} />
      <CustomAppBar
        title={"Reporte"}
        center
        onPressBackButton={() => navigation.goBack()}
      />
      <View
        style={{
          margin: 12,
          backgroundColor: "white",
          borderRadius: 12,
          padding: 12,
        }}
      >
        <TouchableOpacity
          onPress={() => setShowPicker({ visible: true, field: "desde" })}
        >
          <View pointerEvents="none">
            <TextInput
              label="Fecha desde"
              value={formatDate(fechaDesde)}
              mode="outlined"
              style={{ backgroundColor: "white" }}
              editable={false}
            />
          </View>
        </TouchableOpacity>
        <View style={{ height: 16 }} />
        <TouchableOpacity
          onPress={() => setShowPicker({ visible: true, field: "hasta" })}
        >
          <View pointerEvents="none">
            <TextInput
              label="Fecha hasta"
              value={formatDate(fechaHasta)}
              style={{ backgroundColor: "white" }}
              mode="outlined"
              editable={false}
            />
          </View>
        </TouchableOpacity>
        <Button
          style={{ marginTop: 12 }}
          mode="contained"
          onPress={() => getInformation()}
        >
          Buscar
        </Button>

        {showPicker.visible && Platform.OS === "android" && (
          <RNDateTimePicker
            mode="date"
            value={showPicker.field === "desde" ? fechaDesde : fechaHasta}
            display="default"
            onChange={handleDateChange}
          />
        )}
        {showPicker.visible && Platform.OS === "ios" && (
          <Modal
            transparent={true}
            animationType="fade"
            visible={showPicker.visible}
          >
            <View
              style={{
                flex: 1,
                justifyContent: "flex-end",
                backgroundColor: "rgba(0,0,0,0.3)",
              }}
            >
              <View
                style={{
                  backgroundColor: "white",
                  padding: 20,
                  borderTopLeftRadius: 20,
                  borderTopRightRadius: 20,
                }}
              >
                <RNDateTimePicker
                  mode="date"
                  themeVariant="light"
                  display="spinner"
                  value={showPicker.field === "desde" ? fechaDesde : fechaHasta}
                  onChange={(event, selectedDate) => {
                    if (selectedDate) {
                      if (showPicker.field === "desde") {
                        setFechaDesde(selectedDate);
                      } else {
                        setFechaHasta(selectedDate);
                      }
                    }
                  }}
                />
                <CustomButton
                  title={"Aceptar"}
                  onPress={() => setShowPicker({ visible: false, field: null })}
                />
              </View>
            </View>
          </Modal>
        )}
      </View>
      {showPdfViewer && htmlContent != "" ? (
        <View style={{ flex: 1 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              paddingHorizontal: 15,
            }}
          >
            <TouchableOpacity onPress={() => setShowPdfViewer(false)}>
              <MaterialCommunityIcons name="close" size={30} color="black" />
            </TouchableOpacity>
            <TouchableOpacity onPress={sharePDF}>
              <MaterialCommunityIcons name="share" size={30} color="black" />
            </TouchableOpacity>
          </View>
          <View style={{ flex: 1, borderWidth: 1 }}>
            <WebView source={{ html: htmlContent }} style={{ flex: 1 }} />
          </View>
        </View>
      ) : (
        <View style={{ flex: 1, alignItems: "center" }}>
          <Text
            style={{
              fontSize: 20,
              fontWeight: "bold",
              color: "black",
              textAlign: "center",
              paddingHorizontal: 10,
              backgroundColor: "white",
              borderRadius: 12,
              padding: 12,
              margin: 12,
            }}
          >
            No hay licencias que vencen entre las fechas seleccionadas
          </Text>
        </View>
      )}
    </View>
  );
}
