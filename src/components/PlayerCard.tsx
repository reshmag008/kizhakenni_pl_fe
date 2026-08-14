import { useState } from 'react';
import { User, MapPin, Crosshair, Target, Pencil, Trash2 } from 'lucide-react';
import { Player } from '@/types/player';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import PlayerForm from './PlayerForm';
import { usePlayer } from '@/context/PlayerContext';
import { toast } from 'sonner';

interface PlayerCardProps {
  player: Player;
}

const PlayerCard = ({ player }: PlayerCardProps) => {
  const { deletePlayer } = usePlayer();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const handleDelete = () => {
    deletePlayer(player.id);
    toast.success('Player deleted successfully!');
    setShowDeleteDialog(false);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'Batsman':
        return 'bg-secondary text-secondary-foreground';
      case 'Bowler':
        return 'bg-primary text-primary-foreground';
      case 'All-Rounder':
        return 'bg-pitch-dark text-primary-foreground';
      case 'Wicket-Keeper':
      case 'Wicket-Keeper Batsman':
        return 'bg-gold-dark text-primary-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <>
      <div className="bg-card rounded-xl shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden group animate-scale-in border border-border">
        {/* Player Image */}
        <div className="relative h-36 sm:h-48 bg-gradient-to-br from-muted to-muted/50 overflow-hidden">
          {player.profile_image ? (
            <img
              src={`https://storage.googleapis.com/rajas_pl/${player.profile_image}`}
              alt={player.fullname}
              // className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              className="group relative hover:shadow-2xl transition-all duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <User className="w-16 h-16 sm:w-20 sm:h-20 text-muted-foreground/30" />
            </div>
          )}
          {/* Role Badge */}
          <div className={`absolute top-2 right-2 sm:top-3 sm:right-3 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold ${getRoleBadgeColor(player.player_role)}`}>
            {player.player_role}
          </div>
        </div>

        {/* Player Info */}
        <div className="p-3 sm:p-5">
          <h3 className="font-heading font-bold text-base sm:text-lg text-foreground mb-2 sm:mb-3 truncate">
            {player.id}. {player.fullname}
          </h3>

          <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
            {player.location && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary flex-shrink-0" />
                <span className="truncate">{player.location}</span>
              </div>
            )}

            {player.batting_style && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Crosshair className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-secondary flex-shrink-0" />
                <span className="truncate">{player.batting_style}</span>
              </div>
            )}

            {player.bowling_style && player.bowling_style !== 'None' && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-pitch-light flex-shrink-0" />
                <span className="truncate">{player.bowling_style}</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {/* <div className="flex gap-2 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowEditDialog(true)}
              className="flex-1 h-8 sm:h-9 text-xs sm:text-sm border-2 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
            >
              <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
              className="flex-1 h-8 sm:h-9 text-xs sm:text-sm border-2 border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-all"
            >
              <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
              Delete
            </Button>
          </div> */}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-card border-2 border-border max-w-[90vw] sm:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-heading">Delete Player?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{player.fullname}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="border-2">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="bg-card border-2 border-border max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg sm:text-xl">Edit Player</DialogTitle>
          </DialogHeader>
          <PlayerForm editPlayer={player} onCancel={() => setShowEditDialog(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PlayerCard;
