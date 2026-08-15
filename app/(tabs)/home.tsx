import PrimaryHeader from "@/components/Headers/PrimaryHeader/primaryHeader";
import TabButton from "@/components/ui/buttons/tabButton";
import FavoriteCard from "@/components/ui/Cards/favoriteCard";
import PrimaryCard from "@/components/ui/Cards/primaryCard";
import ProductCard from "@/components/ui/Cards/productCard";
import SearchBar from "@/components/ui/searchBar";
import { ScrollView, Text, View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

export default function Home() {
  return (
    <View style={{ flex: 1 }}>
      <PrimaryHeader />
      <ScrollView
        horizontal={false}
        showsVerticalScrollIndicator={true}
        contentContainerStyle={styles.mainTabContainer}
      >
        <View style={styles.container}>
          <Text style={styles.Titles}>Buscar Ruta</Text>
          <View style={{ marginRight: 20 }}>
            <SearchBar
              placeHolder="Buscar Ruta"
              icon={require("../../assets/icons/search.svg")}
            />
          </View>

          {/* carrucel de lugares mas concurridos */}
          <ScrollView
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabContainer}
          >
            <TabButton
              title="Terminal de David"
              onPress={() => console.log("Ruta 1")}
            />
            <TabButton title="Cocetrab" onPress={() => console.log("Ruta 2")} />
            <TabButton
              title="Parada Doña Fela"
              onPress={() => console.log("Ruta 3")}
            />
          </ScrollView>
          <Text style={styles.Titles}>Paradas Más Cercanas</Text>
          {/* carrucel de paradas mas cercanas */}
          <ScrollView
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabContainer}
          >
            <PrimaryCard
              lugar="Terminal de David"
              nextBus="5"
              distance="2.5"
              time="10"
            />
            <PrimaryCard
              lugar="Terminal de David"
              nextBus="5"
              distance="2.5"
              time="10"
            />
          </ScrollView>
          <Text style={styles.Titles}>Promociones</Text>
          {/* carrucel de promociones */}
          <ScrollView
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabContainer}
          >
            <ProductCard
              title="Legend Burger"
              description="Lleva 2 Legends burger por el precio de 1 con papas y un 1 Litro de Soda"
              img="https://th.bing.com/th/id/R.69aa1110083704307653e8457ed59926?rik=W4%2bSdeaQUHmpag&pid=ImgRaw&r=0"
            />
            <ProductCard
              title="Legend Burger"
              description="Lleva 2 Legends burger por el precio de 1 con papas y un 1 Litro de Soda"
              img="https://th.bing.com/th/id/R.69aa1110083704307653e8457ed59926?rik=W4%2bSdeaQUHmpag&pid=ImgRaw&r=0"
            />
          </ScrollView>
          <Text style={styles.Titles}>Rutas Favoritas</Text>
          <ScrollView
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabContainer}
          >
            <FavoriteCard routeName="Casa Rosa" />
            <FavoriteCard routeName="Super 99" />
            <FavoriteCard routeName="Cocetrab" />
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
}

export const styles = StyleSheet.create((theme) => ({
  container: {
    paddingTop: 20,
    marginLeft: 20,
  },
  Titles: {
    fontSize: 20,
    fontFamily: theme.fonts.heavy,
    color: theme.text.Body,
    marginBottom: 10,
  },
  tabContainer: {
    flexDirection: "row",
    gap: 10,
    paddingTop: 10,
    marginBottom: 20,
  },
  mainTabContainer: {
    marginBottom: 20,
  },
}));
