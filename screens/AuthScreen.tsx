import { View, Text } from "react-native";

export default function AuthScreen() {
    return (
        <View
            style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#000",
            }}
        >
            <Text
                style={{
                    color: "#fff",
                    fontSize: 28,
                    fontWeight: "bold",
                }}
            >
                Divvy Auth
            </Text>
        </View>
    );
}