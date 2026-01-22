import {
  View,
  Text,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";
import React, { useState } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import CustomAppBar from "../components/CustomAppBar";
import { Button, TextInput } from "react-native-paper";
import instance from "../utils/Instance";

export default function EditLicWebScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { item } = route.params;

  const [formFields, setFormFields] = useState({
    client_id: item?.client_id ?? "",
    fechainstalacion: item?.fecha_instalacion?.split(" ")[0] ?? "",
    fechapago: item?.fecha_pago?.split(" ")[0] ?? "",
    meses: item?.meses ?? "",
  });

  const handleSave = async () => {
    try {
      if (item?.id) {
        await instance.put("licencia-web/update/" + item.id, formFields);
        Alert.alert("Licencia actualizada", "¡Gracias por actualizar!");
      } else {
        await instance.post("licencia-web/add", formFields);
        Alert.alert("Licencia creada", "¡Gracias por crear!");
      }
    } catch (error) {
      console.log("Error al guardar:", error?.response?.data || error.message);
    } finally {
      navigation.goBack();
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <CustomAppBar
        center
        onPressBackButton={() => navigation.goBack()}
        title={
          item?.client_id
            ? (item.client_id ?? "").toUpperCase()
            : "Nueva Licencia"
        }
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>
            <View style={{ width: "100%", padding: 12 }}>
              <TextInput
                style={styles.textInput}
                mode="outlined"
                value={formFields.client_id}
                onChangeText={(text) =>
                  setFormFields({ ...formFields, client_id: text })
                }
                label={"Client ID"}
              />

              <TextInput
                style={styles.textInput}
                mode="outlined"
                value={formFields.meses}
                onChangeText={(text) =>
                  setFormFields({ ...formFields, meses: text })
                }
                label={"Meses"}
              />

              <TextInput
                style={styles.textInput}
                mode="outlined"
                value={formFields.fechainstalacion}
                onChangeText={(text) =>
                  setFormFields({ ...formFields, fechainstalacion: text })
                }
                label={"Fecha Instalación"}
              />

              <TextInput
                style={styles.textInput}
                mode="outlined"
                value={formFields.fechapago}
                onChangeText={(text) =>
                  setFormFields({ ...formFields, fechapago: text })
                }
                label={"Fecha Pago"}
              />

              <View style={{ height: 20 }} />

              <Button mode="contained" onPress={handleSave}>
                {item?.id ? "Actualizar" : "Crear"}
              </Button>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    margin: 12,
    backgroundColor: "white",
    borderRadius: 12,
  },
  textInput: {
    backgroundColor: "white",
    marginBottom: 10,
  },
});
