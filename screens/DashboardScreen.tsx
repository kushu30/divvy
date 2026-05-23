import {
    SafeAreaView,
    Text,
    Button,
} from "react-native";

import { supabase } from "../lib/supabase";

export default function DashboardScreen() {
    async function handleLogout() {
        await supabase.auth.signOut();
    }

    return (
        <SafeAreaView
            style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "black",
            }}
        >
            <Text
                style={{
                    color: "white",
                    fontSize: 32,
                    fontWeight: "bold",
                    marginBottom: 24,
                }}
            >
                Dashboard
            </Text>

            <Button
                title="Logout"
                onPress={handleLogout}
            />
        </SafeAreaView>
    );
}