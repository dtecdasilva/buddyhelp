'use client';
import { SignInButton, UserButton } from "@clerk/clerk-react";
import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { db } from "../firebase"; // Adjust to correct path
import { doc, setDoc, getDoc } from "firebase/firestore";
import * as Dialog from '@radix-ui/react-dialog';
import { FiHeart, FiMenu, FiMessageSquare } from "react-icons/fi";
import Sidebar from "./Sidebar";
import { Button } from "./ui/button";

function Navigation() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [matchedUser, setMatchedUser] = useState<string | null>(null);
    const [isModalOpen, setModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        age: "",
        country: "",
        gender: "",
    });
    const [loading, setLoading] = useState(true);

    const { isSignedIn, user } = useUser();

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        const fetchUserData = async () => {
            if (user) {
                try {
                    const userDoc = await getDoc(doc(db, "users", user.id));
                    if (userDoc.exists()) {
                        setMatchedUser(userDoc.id);
                        const userData = userDoc.data();
                        setFormData({
                            age: userData.age || "",
                            country: userData.country || "",
                            gender: userData.gender || "",
                        });

                        if (!userData.age || !userData.country || !userData.gender) {
                            setModalOpen(true);
                        }
                    } else {
                        setMatchedUser(null);
                        setModalOpen(true);
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                }
                finally {
                    setLoading(false);
                }
            }
        };
        fetchUserData();
    }, [user]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!user) {
            console.error("User is not authenticated.");
            return;
        }
        
        try {
            const userData = {
                email: user.primaryEmailAddress?.emailAddress || user?.emailAddresses[0]?.emailAddress,
                name: `${user.firstName} ${user.lastName}`,
                age: formData.age,
                country: formData.country,
                gender: formData.gender,
            };
            await setDoc(doc(db, "users", user.id), userData);
            console.log("User data saved!");
            setModalOpen(false); // Close modal on successful form submission
        } catch (error) {
            console.error("Error saving user data:", error);
        }
    };
    

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

    return (
        <nav className={`fixed top-0 w-full z-50 transition-all duration-300 p-3 ${isScrolled ? 'bg-gray-900 shadow-md' : 'bg-white'}`}>
        <div className="flex justify-between items-center max-w-7xl mx-auto px-4 py-3">
          {/* Logo */}
          <h1 className={`text-2xl font-extrabold tracking-wide ${isScrolled ? 'text-white' : 'text-black'}`}>
            Buddy<span className="text-yellow-300">Help</span>
          </h1>
  
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#home" className={`py-2 px-4 transition-colors duration-300 ${isScrolled ? 'text-gray-300 hover:text-yellow-400' : 'text-gray-700 hover:text-yellow-600'}`}>
              Home
            </a>
            <a href="#about" className={`py-2 px-4 transition-colors duration-300 ${isScrolled ? 'text-gray-300 hover:text-yellow-400' : 'text-gray-700 hover:text-yellow-600'}`}>
              About Us
            </a>
            <a href="#howitworks" className={`py-2 px-4 transition-colors duration-300 ${isScrolled ? 'text-gray-300 hover:text-yellow-400' : 'text-gray-700 hover:text-yellow-600'}`}>
              How It Works
            </a>
  
            {/* Modal & Auth Buttons */}
            <div>
              {!isSignedIn ? (
                <SignInButton mode="modal">
                  <Button className={`flex items-center border border-black px-4 py-2 rounded-lg text-sm sm:text-base transition ${isScrolled ? 'border-white text-white hover:bg-white hover:text-black' : 'text-black hover:bg-black hover:text-white'}`}>
                    <FiHeart className="mr-2" size={20} />
                    Volunteer as a Listener
                  </Button>
                </SignInButton>
              ) : (
                <div className="flex items-center relative">
                  <UserButton afterSignOutUrl="/" />
                  <FiMessageSquare className={`ml-4 text-2xl cursor-pointer ${isScrolled ? 'text-white' : 'text-black'}`} onClick={toggleSidebar} /> {/* Chat icon */}
                  {matchedUser && !loading && <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} volunteerId={matchedUser} />}
                  {isModalOpen && (
                    <Dialog.Root open={isModalOpen} onOpenChange={setModalOpen}>
                      <Dialog.Portal>
                        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
                        <Dialog.Content className="fixed inset-0 z-50 flex items-center justify-center">
                          <div className="p-6 bg-gray-800 text-white rounded-lg shadow-lg w-96">
                            <Dialog.Title className="text-lg font-bold">Complete Your Profile</Dialog.Title>
                            <form onSubmit={handleSubmit}>
                              <div className="mb-4">
                                <label className="block">Age:</label>
                                <input
                                  type="number"
                                  name="age"
                                  value={formData.age}
                                  onChange={handleInputChange}
                                  required
                                  className="w-full p-2 border border-gray-500 rounded bg-gray-700 text-white"
                                />
                              </div>
                              <div className="mb-4">
                                <label className="block">Country:</label>
                                <input
                                  type="text"
                                  name="country"
                                  value={formData.country}
                                  onChange={handleInputChange}
                                  required
                                  className="w-full p-2 border border-gray-500 rounded bg-gray-700 text-white"
                                />
                              </div>
                              <div className="mb-4">
                                <label className="block">Gender:</label>
                                <select
                                  name="gender"
                                  value={formData.gender}
                                  onChange={handleInputChange}
                                  required
                                  className="w-full p-2 border border-gray-500 rounded bg-gray-700 text-white"
                                >
                                  <option value="">Select</option>
                                  <option value="male">Male</option>
                                  <option value="female">Female</option>
                                  <option value="other">Other</option>
                                </select>
                              </div>
                              <div className="flex justify-end">
                                <Dialog.Close asChild>
                                  <button type="button" className="mr-2 bg-gray-600 py-2 px-4 rounded hover:bg-gray-700">
                                    Cancel
                                  </button>
                                </Dialog.Close>
                                <button type="submit" className="bg-yellow-500 py-2 px-4 rounded hover:bg-yellow-400">
                                  Save
                                </button>
                              </div>
                            </form>
                          </div>
                        </Dialog.Content>
                      </Dialog.Portal>
                    </Dialog.Root>
                  )}
                </div>
              )}
            </div>
          </div>
  
          {/* Mobile Navigation */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMobileMenu}
              className={`p-2 rounded-md transition-colors duration-300 ${isScrolled ? 'text-white' : 'text-black'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white`}
            >
              <FiMenu size={24} />
            </button>
            {isMobileMenuOpen && (
              <div className="absolute top-12 right-0 w-50 bg-white shadow-lg rounded-lg z-50">
                <a href="#home" className="block px-4 py-2 text-gray-700 hover:bg-gray-200">Home</a>
                <a href="#about" className="block px-4 py-2 text-gray-700 hover:bg-gray-200">About Us</a>
                <a href="#howitworks" className="block px-4 py-2 text-gray-700 hover:bg-gray-200">How It Works</a>
                <div className="mt-4 px-4">
                  {!isSignedIn ? (
                    <SignInButton mode="modal">
                        <Button className={`flex items-center border border-black px-4 py-2 mb-5 rounded-lg text-sm sm:text-base transition`}>
                            <FiHeart className="mr-2" size={20} />
                            Volunteer as a Listener
                        </Button>
                    </SignInButton>
                  ) : (
                    <div className="flex items-center relative px-5 py-2">
                      <UserButton afterSignOutUrl="/" />
                      <FiMessageSquare className={`ml-4 text-2xl cursor-pointer ${isScrolled ? 'text-white' : 'text-black'}`} onClick={toggleSidebar} />
                      {matchedUser && !loading && <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} volunteerId={matchedUser} />}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>
        
    );
}

export default Navigation;
