from tkinter import *
from tkinter import ttk

import random
import time

from PIL import ImageTk, Image # For png and jpg

root = Tk()

root.title("RPS")

main_menu = Menu(root, tearoff=0)

file_menu = Menu(main_menu, tearoff=0)

# Add commands to submenu
file_menu.add_command(label="Quit!", command=root.destroy)
file_menu.add_command(label="Exit!", command=root.destroy)
file_menu.add_command(label="End!", command=root.destroy)

# Add the "File" drop down sub-menu in the main menu bar
main_menu.add_cascade(label="File", menu=file_menu)

main_menu.add_command(label="Quit", command=root.destroy)

root.config(menu=main_menu)

# root.attributes('-fullscreen', True)

root.geometry("500x300+50+50")

canvasc = Canvas(root, width=100, height=100)
canvasc.grid(column=1, row=1)

canvasy = Canvas(root, width=100, height=100)
canvasy.grid(column=2, row=1)

rockimg = Image.open("rock.png")
rockimg = rockimg.resize((90, 90), Image.ANTIALIAS)
rocktkimg = ImageTk.PhotoImage(rockimg)

paperimg = Image.open("paper.png")
paperimg = paperimg.resize((90, 90), Image.ANTIALIAS)
papertkimg = ImageTk.PhotoImage(paperimg)

scissorsimg = Image.open("scissors.png")
scissorsimg = scissorsimg.resize((90, 90), Image.ANTIALIAS)
scissorstkimg = ImageTk.PhotoImage(scissorsimg)

entry = ttk.Entry(root, text="Test")
entry.grid(row=0, column=0, padx=10, pady=10)

text = Label(root)
text.grid(row=2, column=1, columnspan=2)

labelc = Label(root, text="Computer:")
labely = Label(root, text="You:")
labelc.grid(column=1, row=0);
labely.grid(column=2, row=0);

def submit():
    entered = entry.get()
    computer = random.randint(1, 3)
    canvasy.delete("all")
    canvasc.delete("all")
    entry.delete(0, 'end')
    if(entered==""):
        text.config(text="You must have forgotten to enter a choice! (r, p, s)")
        return
    elif(entered=="r" or entered=="R"):
        canvasy.create_image(5, 5, anchor=NW, image=rocktkimg)
        if(computer==1):
            text.config(text="Tie!")
        elif(computer==2):
            text.config(text="You lose!")
        else:
            text.config(text="You win!")
    elif(entered=="p" or entered=="P"):
        canvasy.create_image(5, 5, anchor=NW, image=papertkimg)
        if(computer==1):
            text.config(text="You win!")
        elif(computer==2):
            text.config(text="Tie!")
        else:
            text.config(text="You lose!")
    elif(entered=="s" or entered=="S"):
        canvasy.create_image(5, 5, anchor=NW, image=scissorstkimg)
        if(computer==1):
            text.config(text="You lose!")
        elif(computer==2):
            text.config(text="You win!")
        else:
            text.config(text="Tie!")
    else:
        text.config(text="That's not an option! (r, p, s)")
        return
    if(computer==1):
        canvasc.create_image(5, 5, anchor=NW, image=rocktkimg)
    elif(computer==2):
        canvasc.create_image(5, 5, anchor=NW, image=papertkimg)
    else:
        canvasc.create_image(5, 5, anchor=NW, image=scissorstkimg)
def submitE(event):
    entered = entry.get()
    computer = random.randint(1, 3)
    canvasy.delete("all")
    canvasc.delete("all")
    entry.delete(0, 'end')
    if(entered==""):
        text.config(text="You must have forgotten to enter a choice! (r, p, s)")
        return
    elif(entered=="r" or entered=="R"):
        canvasy.create_image(5, 5, anchor=NW, image=rocktkimg)
        if(computer==1):
            text.config(text="Tie!")
        elif(computer==2):
            text.config(text="You lose!")
        else:
            text.config(text="You win!")
    elif(entered=="p" or entered=="P"):
        canvasy.create_image(5, 5, anchor=NW, image=papertkimg)
        if(computer==1):
            text.config(text="You win!")
        elif(computer==2):
            text.config(text="Tie!")
        else:
            text.config(text="You lose!")
    elif(entered=="s" or entered=="S"):
        canvasy.create_image(5, 5, anchor=NW, image=scissorstkimg)
        if(computer==1):
            text.config(text="You lose!")
        elif(computer==2):
            text.config(text="You win!")
        else:
            text.config(text="Tie!")
    else:
        text.config(text="That's not an option! (r, p, s)")
        return
    if(computer==1):
        canvasc.create_image(5, 5, anchor=NW, image=rocktkimg)
    elif(computer==2):
        canvasc.create_image(5, 5, anchor=NW, image=papertkimg)
    else:
        canvasc.create_image(5, 5, anchor=NW, image=scissorstkimg)

entry.bind('<Return>', submitE)

button = Button(root, text="Submit", command=submit).grid(row=1, column=0, padx=10, pady=5, sticky=W+E)

root.mainloop()
