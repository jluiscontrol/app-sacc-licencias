import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Animated,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import CustomAppBar from "../components/CustomAppBar";
import Loader from "../components/Loader";
import { FlashList } from "@shopify/flash-list";
import instance from "../utils/Instance";
import useAuthStore from "../stores/AuthStore";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import CustomFAB from "../components/CustomFAB";
import { TextInput } from "react-native-paper";
import { PRIMARY_COLOR } from "../utils/colors";

export default function LicenciasMobileScreen() {
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
      const response = await instance.get("licencia/list");
      setData(response.data.data);
      setFilteredData(response.data.data);
      setIsLoaging(false);
    }
    getInformation();
  }, [isRefresh]);

  useEffect(() => {
    if (searchText === "") {
      setFilteredData(data);
    } else {
      const lower = searchText.toLowerCase();
      const filtered = data.filter((item) =>
        (item.descripcion ?? "").toLowerCase().includes(lower)
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
        style={styles.swipeable}
        onPress={() => {
          navigation.navigate("EditMobile", { item });
        }}
      >
        <MaterialCommunityIcons name="pencil" size={30} color={"white"} />
        <Text style={{ fontWeight: "bold", color: "white" }}>Editar</Text>
      </TouchableOpacity>
    );
  };

  const renderItem = ({ item, index }) => {
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
            {(item.descripcion ?? "").toUpperCase()}
          </Text>
          <Text>Clave: {item.clave}</Text>
          <Text>Ruc: {item.ruc}</Text>
          <Text>Ruta: {item.ruta}</Text>
        </View>
      </Swipeable>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <Loader loading={isLoaging} />
      <CustomFAB navigation={navigation} route={"EditMobile"} />
      <CustomAppBar
        title={"Licencias Movil"}
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
