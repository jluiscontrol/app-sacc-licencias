import {
  View,
  Text,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import React, { useState } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import CustomAppBar from "../components/CustomAppBar";
import CustomButton from "../components/CustomButton";
import { Button, TextInput } from "react-native-paper";
import instance from "../utils/Instance";
import { ScrollView } from "react-native";

export default function EditLicMobileScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { item } = route.params;

  const [formFields, setFormFields] = useState({
    clave: item?.clave ?? "",
    client_id: item?.client_id ?? "",
    client_password: item?.client_password ?? "",
    descripcion: item?.descripcion ?? "",
    id: item?.id ?? "",
    referencia: item?.referencia ?? "",
    ruc: item?.ruc ?? "",
    ruta: item?.ruta ?? "",
  });

  const handleSave = async () => {
    try {
      if (item?.ruc) {
        await instance.put("licencia/update/" + item.id, formFields);
        Alert.alert("Licencia actualizada", "¡Gracias por actualizar!");
      } else {
        await instance.post("licencia/add", formFields);
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
          item?.ruc ? (item.descripcion ?? "").toUpperCase() : "Nueva Licencia"
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
            <View
              style={{
                width: "100%",
                padding: 12,
              }}
            >
              <TextInput
                style={styles.textInput}
                mode="outlined"
                value={formFields.clave}
                onChangeText={(text) =>
                  setFormFields({ ...formFields, clave: text })
                }
                label={"Clave"}
              />
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
                value={formFields.client_password}
                onChangeText={(text) =>
                  setFormFields({ ...formFields, client_password: text })
                }
                label={"Client Password"}
              />
              <TextInput
                style={styles.textInput}
                mode="outlined"
                value={formFields.descripcion}
                onChangeText={(text) =>
                  setFormFields({ ...formFields, descripcion: text })
                }
                label={"Descripción"}
              />
              <TextInput
                style={styles.textInput}
                mode="outlined"
                value={formFields.referencia}
                onChangeText={(text) =>
                  setFormFields({ ...formFields, referencia: text })
                }
                label={"Referencia"}
              />
              <TextInput
                style={styles.textInput}
                mode="outlined"
                value={formFields.ruc}
                onChangeText={(text) =>
                  setFormFields({ ...formFields, ruc: text })
                }
                label={"RUC"}
              />
              <TextInput
                style={styles.textInput}
                mode="outlined"
                value={formFields.ruta}
                onChangeText={(text) =>
                  setFormFields({ ...formFields, ruta: text })
                }
                label={"Ruta"}
              />
              <View style={{ height: 20 }} />
              <Button mode="contained" onPress={handleSave}>
                {item?.ruc ? "Actualizar" : "Crear"}
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
