import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import CustomAppBar from "../components/CustomAppBar";
import instance from "../utils/Instance";
import useAuthStore from "../stores/AuthStore";
import Loader from "../components/Loader";
import { FlashList } from "@shopify/flash-list";
import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import CustomFAB from "../components/CustomFAB";
import { Searchbar, TextInput } from "react-native-paper";
import { PRIMARY_COLOR } from "../utils/colors";
import { calcularDiasRestantes } from "../utils/utils";
import { RefreshControl } from "react-native-gesture-handler";
import * as Notifications from "expo-notifications";

export default function LicenciasWebScreen() {
  const navigation = useNavigation();
  const { logout } = useAuthStore();
  const [data, setData] = useState([]);
  const [isLoaging, setIsLoaging] = useState(false);
  const [isRefresh, setIsRefresh] = useState(false);
  const [filteredData, setFilteredData] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [searchText, setSearchText] = useState("");

  const searchHeight = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    React.useCallback(() => {
      setIsRefresh((prev) => !prev);
    }, [])
  );

  useEffect(() => {
    async function getInformation() {
      setIsLoaging(true);
      const response = await instance.get("licencia-web/list");

      setData(response.data.data);
      setFilteredData(response.data.data);
      setIsLoaging(false);
    }
    getInformation();
  }, [isRefresh]);

  useEffect(() => {
    async function sendNotifications() {
      try {
        const response = await instance.get("licencia-web/list");
        const licenciasQueExpiran = response.data.data.filter((item) => {
          const { dias } = calcularDiasRestantes(item.fecha_pago, item.meses);

          if (dias === "Ilimitado" || dias === "Expirado") return false;

          const diasNumericos = parseInt(
            dias.toString().replace(/\D/g, ""),
            10
          );

          if (isNaN(diasNumericos)) return false;

          return diasNumericos >= 0 && diasNumericos <= 5;
        });

        for (let licencia of licenciasQueExpiran) {
          const { dias } = calcularDiasRestantes(
            licencia.fecha_pago,
            licencia.meses
          );
          const diasNumericos = parseInt(
            dias.toString().replace(/\D/g, ""),
            10
          );
          await Notifications.scheduleNotificationAsync({
            content: {
              title: `⚠️ Licencia de ${(
                licencia.client_id ?? ""
              ).toUpperCase()}`,
              body: `La licencia de ${(
                licencia.client_id ?? ""
              ).toUpperCase()} expira en ${dias}`,
            },
            trigger: null,
          });
        }
      } catch (error) {
        console.error(error);
      }
    }
    sendNotifications();
  }, []);

  useEffect(() => {
    if (searchText === "") {
      setFilteredData(data);
    } else {
      const lower = searchText.toLowerCase();
      const filtered = data.filter((item) =>
        (item.client_id ?? "").toLowerCase().includes(lower)
      );
      setFilteredData(filtered);
    }
  }, [searchText, data]);

  const openSearch = () => {
    setShowSearch(true);

    Animated.timing(searchHeight, {
      toValue: 70,
      duration: 250,
      useNativeDriver: false,
    }).start();
  };

  const closeSearch = () => {
    Animated.timing(searchHeight, {
      toValue: 0,
      duration: 250,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) {
        setShowSearch(false);
        setSearchText("");
      }
    });
  };

  const renderRightActions = (item) => {
    return (
      <TouchableOpacity
        onPress={() => {
          navigation.navigate("EditWeb", { item });
        }}
        style={styles.swipeable}
      >
        <MaterialCommunityIcons name="pencil" size={30} color={"white"} />
        <Text style={{ fontWeight: "bold", color: "white" }}>Editar</Text>
      </TouchableOpacity>
    );
  };

  const renderItem = ({ item, index }) => {
    const { dias } = calcularDiasRestantes(item.fecha_pago, item.meses);
    const isFirst = index === 0;
    const isLast = index === filteredData.length - 1;
    return (
      <Swipeable renderRightActions={() => renderRightActions(item)}>
        <View
          style={{
            backgroundColor: "white",
            borderTopLeftRadius: isFirst ? 18 : 5,
            borderTopRightRadius: isFirst ? 18 : 5,
            borderBottomLeftRadius: isLast ? 18 : 5,
            borderBottomRightRadius: isLast ? 18 : 5,
            marginBottom: 5,
            paddingVertical: 14,
            paddingHorizontal: 12,
          }}
        >
          <Text style={{ fontWeight: "bold", fontSize: 16 }}>
            {(item.client_id ?? "").toUpperCase()}
          </Text>
          <Text>
            Fecha de Instalacion: {item.fecha_instalacion?.split(" ")[0]}
          </Text>
          <Text>Fecha de Pago: {item.fecha_pago?.split(" ")[0]}</Text>
          <Text>Meses: {item.meses}</Text>
          <Text>Tiempo restante: {dias}</Text>
        </View>
      </Swipeable>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <Loader loading={isLoaging} />
      <CustomFAB navigation={navigation} route={"EditWeb"} />
      <CustomAppBar
        title={"Licencias Web"}
        center
        leftIcon={"logout"}
        onPressLeftIcon={logout}
        rightIcon={showSearch ? "close" : "magnify"}
        onPressRightIcon={() => {
          if (showSearch) {
            closeSearch();
          } else {
            openSearch();
          }
        }}
      />
      <Animated.View style={{ height: searchHeight, overflow: "hidden" }}>
        {showSearch && (
          <Searchbar
            placeholder="Buscar viaje..."
            value={searchText}
            onChangeText={setSearchText}
            autoFocus
            onClearIconPress={closeSearch}
            style={{
              backgroundColor: "white",
              marginHorizontal: 12,
              marginTop: 12,
            }}
          />
        )}
      </Animated.View>

      <FlashList
        data={filteredData}
        renderItem={renderItem}
        estimatedItemSize={118}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={{ padding: 12, flexGrow: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={isLoaging}
            onRefresh={() => setIsRefresh(!isRefresh)}
            colors={[PRIMARY_COLOR]}
            tintColor={PRIMARY_COLOR}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  licenciaItem: {
    backgroundColor: "white",
    marginTop: 15,
    marginHorizontal: 10,
    padding: 15,
    borderRadius: 10,
  },
  swipeable: {
    backgroundColor: PRIMARY_COLOR,
    height: "90%",
    marginLeft: 5,
    padding: 15,
    borderRadius: 10,
    width: 90,
    alignContent: "center",
    alignItems: "center",
    alignSelf: "center",
    justifyContent: "center",
  },
});
