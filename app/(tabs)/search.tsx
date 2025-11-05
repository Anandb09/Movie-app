import MovieCard from "@/components/MovieCard";
import SearchBar from "@/components/SearchBar";
import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import { fetchMovies } from "@/Services/api";
import { updateSearchCount } from "@/Services/appWrite";
import useFetch from "@/Services/useFetch";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Image, Text, View } from "react-native";

const Search = () => {
  const [searchQuery, setSearchQuery] = useState("");
  // --- FIX 1: Add state for the query that was *actually* run ---
  const [lastQuery, setLastQuery] = useState("");

  const {
    data: movies,
    loading,
    error,
    refetch: loadMovies,
    reset,
  } = useFetch(() => fetchMovies({ query: searchQuery }), false);

  // --- FIX 2: This effect ONLY handles DEBOUNCING the search ---
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      // Run search if query is not empty
      if (searchQuery.trim()) {
        setLastQuery(searchQuery.trim()); // Set the lastQuery *as* we run it
        loadMovies();
      }
      // Clear results and lastQuery if query is empty
      else {
        setLastQuery("");
        reset();
      }
    }, 500); // 500ms debounce

    // Clear timeout on cleanup
    return () => clearTimeout(timeoutId);
  }, [searchQuery]); // Only depend on the user's input

  // --- FIX 3: This effect ONLY handles REACTING to *new* movies ---
  // This runs *after* loadMovies() is done and the `movies` state has updated
  useEffect(() => {
    if (movies?.length > 0 && movies?.[0] && lastQuery) {
      // Log the search count with the query that *fetched* these movies
      updateSearchCount(lastQuery, movies[0]);
    }
  }, [movies]); // Only depend on the movie results

  return (
    <View className="flex-1 bg-primary">
      <Image source={images.bg} className="flex-1 absolute w-full z-0" />

      <FlatList
        data={movies}
        renderItem={({ item }) => <MovieCard {...item} />}
        // keyExtractor={(item: any) => item.id.toString()}
        keyExtractor={(item: any) => `search-${item.id}`}
        className="px-5"
        numColumns={3}
        columnWrapperStyle={{
          justifyContent: "center",
          gap: 16,
          marginVertical: 16,
        }}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListHeaderComponent={
          <>
            <View className="w-full flex-row justify-center mt-20 items-center">
              <Image source={icons.logo} className="w-12 h-10" />
            </View>

            <View className="my-5">
              <SearchBar
                placeholder="Search Movie.."
                value={searchQuery}
                onChangeText={(text: string) => setSearchQuery(text)}
              />
            </View>

            {loading && (
              <ActivityIndicator
                size="large"
                color="#0000ff"
                className="my-3"
              />
            )}
            {error && (
              <Text className="text-red-500 px-5 my-3">
                Error: {error.message}
              </Text>
            )}

            {/* --- FIX 4: Use `lastQuery` for the title --- */}
            {/* This ensures the title only shows for the movies on screen */}
            {!loading && !error && lastQuery && movies?.length > 0 && (
              <Text className="text-xl text-white font-bold">
                Search Results for
                <Text className="text-accent"> {lastQuery}</Text>
              </Text>
            )}
          </>
        }
        ListEmptyComponent={
          !loading && !error ? (
            <View className="text-center px-5">
              <Text className="text-center text-gray-500">
                {/* --- FIX 5: Use `lastQuery` here too --- */}
                {lastQuery ? "No movies found" : "Search for a movie"}
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
};

export default Search;
