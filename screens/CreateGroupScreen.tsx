import { useState } from "react";

import {
    Alert,
    Button,
    SafeAreaView,
    Text,
    TextInput,
} from "react-native";

import { supabase } from "../lib/supabase";

export default function CreateGroupScreen() {
    const [name, setName] = useState("");

    const [loading, setLoading] =
        useState(false);

    async function handleCreateGroup() {
        try {
            setLoading(true);

            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) {
                Alert.alert("User not found");
                return;
            }

            console.log("USER ID:", user.id);

            const { data, error } =
                await supabase
                    .from("groups")
                    .insert([
                        {
                            name: name,
                            created_by: user.id,
                        },
                    ])
                    .select()
                    .single();

            console.log(error);
            
            if (error) {
                Alert.alert(error.message);

                return;
            }

            await supabase
                .from("group_members")
                .insert({
                    group_id: data.id,
                    user_id: user.id,
                });

            Alert.alert("Group created");

            setName("");
        } catch (error) {
            Alert.alert("Something went wrong");
        } finally {
            setLoading(false);
        }
    }

    return (
        <SafeAreaView
            style={{
                flex: 1,
                justifyContent: "center",
                padding: 24,
                backgroundColor: "black",
            }}
        >
            <Text
                style={{
                    color: "white",
                    fontSize: 28,
                    fontWeight: "bold",
                    marginBottom: 24,
                }}
            >
                Create Group
            </Text>

            <TextInput
                placeholder="Trip to Goa"
                placeholderTextColor="gray"
                value={name}
                onChangeText={setName}
                style={{
                    borderWidth: 1,
                    borderColor: "gray",
                    padding: 14,
                    borderRadius: 12,
                    marginBottom: 24,
                    color: "white",
                }}
            />

            <Button
                title={
                    loading
                        ? "Creating..."
                        : "Create Group"
                }
                onPress={handleCreateGroup}
            />
        </SafeAreaView>
    );
}