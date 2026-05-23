import {
    Button,
    FlatList,
    SafeAreaView,
    Text,
    View,
} from "react-native";

import {
    useEffect,
    useState,
} from "react";

import { supabase } from "../lib/supabase";

import CreateGroupScreen from "./CreateGroupScreen";

type Group = {
    id: string;
    name: string;
};

export default function DashboardScreen() {
    const [groups, setGroups] = useState<
        Group[]
    >([]);

    async function handleLogout() {
        await supabase.auth.signOut();
    }

    async function fetchGroups() {
        const { data, error } =
            await supabase
                .from("groups")
                .select("*")
                .order("created_at", {
                    ascending: false,
                });

        if (!error && data) {
            setGroups(data);
        }
    }

    useEffect(() => {
        fetchGroups();
    }, []);

    return (
        <SafeAreaView
            style={{
                flex: 1,
                backgroundColor: "black",
                padding: 24,
            }}
        >
            <View
                style={{
                    marginBottom: 24,
                }}
            >
                <Text
                    style={{
                        color: "white",
                        fontSize: 32,
                        fontWeight: "bold",
                        marginBottom: 12,
                    }}
                >
                    Divvy
                </Text>

                <Button
                    title="Logout"
                    onPress={handleLogout}
                />
            </View>

            <FlatList
                data={groups}
                keyExtractor={(item) => item.id}
                style={{
                    marginBottom: 24,
                }}
                renderItem={({ item }) => (
                    <View
                        style={{
                            padding: 16,
                            borderWidth: 1,
                            borderColor: "gray",
                            borderRadius: 12,
                            marginBottom: 12,
                        }}
                    >
                        <Text
                            style={{
                                color: "white",
                                fontSize: 18,
                                fontWeight: "600",
                            }}
                        >
                            {item.name}
                        </Text>
                    </View>
                )}
            />

            <CreateGroupScreen />
        </SafeAreaView>
    );
}