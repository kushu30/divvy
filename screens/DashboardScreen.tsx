import {
    Button,
    SafeAreaView,
    Text,
    View,
} from "react-native";

import CreateGroupScreen from "./CreateGroupScreen";

import { supabase } from "../lib/supabase";

export default function DashboardScreen() {
    async function handleLogout() {
        await supabase.auth.signOut();
    }

    return (
        <SafeAreaView
            style={{
                flex: 1,
                backgroundColor: "black",
            }}
        >
            <View
                style={{
                    padding: 24,
                }}
            >
                <Text
                    style={{
                        color: "white",
                        fontSize: 32,
                        fontWeight: "bold",
                        marginBottom: 16,
                    }}
                >
                    Divvy
                </Text>

                <Button
                    title="Logout"
                    onPress={handleLogout}
                />
            </View>

            <CreateGroupScreen />
        </SafeAreaView>
    );
}